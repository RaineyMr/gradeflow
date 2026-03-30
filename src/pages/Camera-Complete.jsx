import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraCapture } from '@components/camera/CameraCapture';
import { CameraOverlay, CameraStatus } from '@components/camera/CameraOverlay';
import { AutoSnapEngine, SnapSignals } from '@lib/AutoSnapEngine';
import { getOCRInstance, OCRResult } from '@lib/ocr';
import { MetadataParser, ParsedGrade } from '@lib/metadataParser';
import { createClient } from '@supabase/supabase-js';
import { Camera, Upload, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

const CameraPage = () => {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraRef = useRef(null);
  const autoSnapEngineRef = useRef(null);
  const ocrProcessorRef = useRef(null);
  const metadataParserRef = useRef(null);

  // State
  const [status, setStatus] = useState('initializing');
  const [detection, setDetection] = useState(null);
  const [snapSignals, setSnapSignals] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [students, setStudents] = useState([]);
  const [parsedGrade, setParsedGrade] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [tally, setTally] = useState(0);
  const [recentGrades, setRecentGrades] = useState([]);

  // Initialize Supabase client
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  // Initialize components
  useEffect(() => {
    const initializeComponents = async () => {
      try {
        if (videoRef.current) {
          cameraRef.current = new CameraCapture(videoRef.current);
          await cameraRef.current.start();
          
          autoSnapEngineRef.current = new AutoSnapEngine(cameraRef.current);
          ocrProcessorRef.current = getOCRInstance();
          await ocrProcessorRef.current.initialize();
          
          metadataParserRef.current = new MetadataParser(students, assignments);
          
          setStatus('scanning');
        }
      } catch (error) {
        setError(error.message);
        setStatus('error');
      }
    };

    initializeComponents();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (autoSnapEngineRef.current) {
        autoSnapEngineRef.current.stop();
      }
      if (ocrProcessorRef.current) {
        ocrProcessorRef.current.terminate();
      }
    };
  }, [students, assignments]);

  // Load assignments and students
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Not authenticated');
        }

        // Load assignments
        const { data: assignmentsData } = await supabase
          .from('assignments')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        setAssignments(assignmentsData || []);

        // Load students (assuming they're in a users table with role='student')
        const { data: studentsData } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('role', 'student');

        setStudents(studentsData || []);

        // Load recent grades
        const { data: recentGradesData } = await supabase
          .from('grades')
          .select(`
            *,
            assignments(name),
            users(name)
          `)
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentGrades(recentGradesData || []);

      } catch (error) {
        console.error('Error loading data:', error);
        setError(error.message);
      }
    };

    loadData();
  }, [supabase]);

  // Handle auto-snap
  const handleAutoSnap = useCallback(async (imageBlob) => {
    setIsProcessing(true);
    setStatus('processing_ocr');
    
    const startTime = Date.now();

    try {
      // Process OCR
      const ocrResult = await ocrProcessorRef.current.processImageWithRetry(imageBlob);
      
      // Parse metadata
      const parsedGrade = metadataParserRef.current.parseOCRResult(
        ocrResult.text,
        selectedAssignment
      );

      if (parsedGrade) {
        setParsedGrade(parsedGrade);
        setStatus('confirming');
      } else {
        setError('Could not extract student name and score. Please try manual entry.');
        setStatus('scanning');
      }

    } catch (error) {
      setError(error.message);
      setStatus('scanning');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedAssignment]);

  // Handle status updates from auto-snap engine
  const handleStatusUpdate = useCallback((signals) => {
    setSnapSignals(signals);
    
    if (signals.consecutiveReady >= 5) {
      setStatus('auto_snapping');
    } else if (status !== 'processing_ocr' && status !== 'confirming') {
      setStatus('scanning');
    }
  }, [status]);

  // Start auto-snap when assignment is selected
  useEffect(() => {
    if (selectedAssignment && autoSnapEngineRef.current && status === 'scanning') {
      autoSnapEngineRef.current.start(handleAutoSnap, handleStatusUpdate);
    }

    return () => {
      if (autoSnapEngineRef.current) {
        autoSnapEngineRef.current.stop();
      }
    };
  }, [selectedAssignment, handleAutoSnap, handleStatusUpdate, status]);

  // Handle manual file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus('processing_ocr');

    try {
      const ocrResult = await ocrProcessorRef.current.processImageWithRetry(file);
      const parsedGrade = metadataParserRef.current.parseOCRResult(
        ocrResult.text,
        selectedAssignment
      );

      if (parsedGrade) {
        setParsedGrade(parsedGrade);
        setStatus('confirming');
      } else {
        setError('Could not extract student name and score from uploaded image.');
        setStatus('scanning');
      }
    } catch (error) {
      setError(error.message);
      setStatus('scanning');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save grade to database
  const saveGrade = async () => {
    if (!parsedGrade || !selectedAssignment) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch('/api/grades/scan-entry', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId: selectedAssignment,
          studentName: parsedGrade.studentName,
          score: parsedGrade.score,
          maxScore: parsedGrade.maxScore,
          confidence: parsedGrade.confidence,
          manualOverride: false,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTally(tally + 1);
        setParsedGrade(null);
        setStatus('scanning');
        
        // Show success message (you could use a toast library here)
        alert(result.message);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual grade entry
  const handleManualEntry = () => {
    // Implementation for manual grade entry form
    // This would open a modal or form for manual input
  };

  const cameraStatus = {
    state: status,
    detection,
    snapSignals,
    error,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Scan to Grade</h1>
          
          {/* Assignment Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Assignment</label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full md:w-96 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!assignments.length}
            >
              <option value="">Choose an assignment...</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.name} ({assignment.max_points} points)
                </option>
              ))}
            </select>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm">Status: {status}</span>
              {tally > 0 && (
                <span className="text-sm text-green-400">Grades recorded: {tally}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 transition-colors"
                disabled={isProcessing}
              >
                <Upload size={16} />
                <span>Upload Image</span>
              </button>
              
              <button
                onClick={handleManualEntry}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <AlertCircle size={16} />
                <span>Manual Entry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera View */}
          <div className="relative">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {selectedAssignment ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  <CameraOverlay
                    status={cameraStatus}
                    videoWidth={1280}
                    videoHeight={720}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Camera size={48} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Please select an assignment to start scanning</p>
                  </div>
                </div>
              )}
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                  <p>{status === 'processing_ocr' ? 'Extracting text...' : 'Processing...'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Grade Form */}
          <div className="space-y-6">
            {parsedGrade ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Check className="mr-2 text-green-400" size={20} />
                  Review Extracted Grade
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Student Name</label>
                    <input
                      type="text"
                      value={parsedGrade.studentName}
                      onChange={(e) => setParsedGrade({...parsedGrade, studentName: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Score</label>
                      <input
                        type="number"
                        value={parsedGrade.score}
                        onChange={(e) => setParsedGrade({...parsedGrade, score: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Score</label>
                      <input
                        type="number"
                        value={parsedGrade.maxScore}
                        onChange={(e) => setParsedGrade({...parsedGrade, maxScore: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Confidence</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${parsedGrade.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm">{Math.round(parsedGrade.confidence)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={saveGrade}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                    >
                      <Check size={16} />
                      <span>Record Grade</span>
                    </button>
                    
                    <button
                      onClick={() => setParsedGrade(null)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Grade Entry</h2>
                <p className="text-gray-400">
                  Position a paper in the camera view or upload an image to automatically extract student name and score.
                </p>
              </div>
            )}

            {/* Recent Grades */}
            {recentGrades.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Grades</h2>
                <div className="space-y-2">
                  {recentGrades.map((grade) => (
                    <div key={grade.id} className="flex justify-between items-center py-2 border-b border-gray-700">
                      <div>
                        <p className="font-medium">{grade.users?.name}</p>
                        <p className="text-sm text-gray-400">{grade.assignments?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{grade.score}/{grade.max_score}</p>
                        <p className="text-sm text-gray-400">{grade.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-900 border border-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="mr-2" size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CameraPage;
