import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, CheckCircle, AlertTriangle, Loader, Info, X, Truck, Package, Ruler } from 'lucide-react';
import { analyzeVehicleImage } from '../services/api';
import { vehicleLibrary } from '../data/mockVehicles';

export default function MeasureVehiclePage() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('photo'); // 'photo' or 'library'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehiclePortfolio, setShowVehiclePortfolio] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehiclePortfolio(true);
  };

  const handleClosePortfolio = () => {
    setShowVehiclePortfolio(false);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const response = await analyzeVehicleImage(imageFile);
      
      console.log('=== FULL API RESPONSE ===');
      console.log(JSON.stringify(response, null, 2));
      console.log('=========================');
      
      // Check if we actually got measurements
      if (!response.measurements || !response.measurements.total_height_inches) {
        console.error('WARNING: No measurements in response!');
        console.log('Response structure:', Object.keys(response));
        if (response.measurements) {
          console.log('Measurements keys:', Object.keys(response.measurements));
        }
      }
      
      setResult(response);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Measure Your Vehicle
        </h1>
        <p className="text-lg text-gray-600">
          Take a photo or select from our vehicle library. Our AI will measure the exact height including all roof equipment.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('photo')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              selectedTab === 'photo'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Camera className="w-5 h-5 inline mr-2" />
            Take/Upload Photo
          </button>
          
          <button
            onClick={() => setSelectedTab('library')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              selectedTab === 'library'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Upload className="w-5 h-5 inline mr-2" />
            Choose from Library
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Upload/Capture Area */}
        <div>
          {selectedTab === 'photo' ? (
            <PhotoUploadSection
              imagePreview={imagePreview}
              fileInputRef={fileInputRef}
              onFileSelect={handleFileSelect}
              onAnalyze={handleAnalyze}
              analyzing={analyzing}
              hasImage={!!imageFile}
            />
          ) : (
            <VehicleLibrarySection onVehicleSelect={handleVehicleSelect} />
          )}
        </div>

        {/* Right: Results */}
        <div>
          {analyzing && <AnalyzingState />}
          {error && <ErrorState message={error} />}
          {result && <ResultsDisplay result={result} navigate={navigate} />}
          {!analyzing && !result && !error && <TipsDisplay />}
        </div>
      </div>

      {/* Vehicle Portfolio Modal */}
      {showVehiclePortfolio && selectedVehicle && (
        <VehiclePortfolioModal 
          vehicle={selectedVehicle} 
          onClose={handleClosePortfolio}
          onUseVehicle={(vehicleData) => {
            setResult(vehicleData);
            setShowVehiclePortfolio(false);
          }}
        />
      )}
    </div>
  );
}

// Photo Upload Section
function PhotoUploadSection({ imagePreview, fileInputRef, onFileSelect, onAnalyze, analyzing, hasImage }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Upload Vehicle Photo</h2>
      
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          imagePreview
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        {imagePreview ? (
          <div>
            <img
              src={imagePreview}
              alt="Vehicle preview"
              className="max-h-64 mx-auto rounded-lg mb-4"
            />
            <p className="text-sm text-gray-600">Click to change photo</p>
          </div>
        ) : (
          <div>
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Take or Upload Photo
            </p>
            <p className="text-sm text-gray-500">
              Click to select a photo of your vehicle
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileSelect}
        className="hidden"
      />

      {/* Analyze Button */}
      <button
        onClick={onAnalyze}
        disabled={!hasImage || analyzing}
        className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {analyzing ? (
          <>
            <Loader className="w-5 h-5 mr-2 animate-spin" />
            Analyzing with AI...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5 mr-2" />
            Analyze Vehicle Height
          </>
        )}
      </button>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">📸 Photo Tips:</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Stand 15-20 feet away from vehicle</li>
          <li>• Include full height from ground to top</li>
          <li>• Take photo from the side</li>
          <li>• Ensure good lighting</li>
          <li>• Include license plate for scale (if visible)</li>
        </ul>
      </div>
    </div>
  );
}

// Vehicle Library Section
function VehicleLibrarySection({ onVehicleSelect }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Common Vehicles</h2>
      
      <div className="space-y-4">
        {vehicleLibrary.map(vehicle => (
          <VehicleLibraryCard 
            key={vehicle.id} 
            vehicle={vehicle}
            onSelect={() => onVehicleSelect(vehicle)}
          />
        ))}
      </div>
    </div>
  );
}

function VehicleLibraryCard({ vehicle, onSelect }) {
  const totalWithMods = vehicle.baseHeight + 
    vehicle.typicalMods.reduce((sum, mod) => sum + mod.height, 0);
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{vehicle.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{vehicle.description}</p>
          
          <div className="flex items-center space-x-4 text-sm">
            <div>
              <span className="text-gray-500">Base:</span>
              <span className="ml-1 font-semibold text-gray-900">{vehicle.heightDisplay}</span>
            </div>
            {vehicle.typicalMods.length > 1 && (
              <div>
                <span className="text-gray-500">With mods:</span>
                <span className="ml-1 font-semibold text-blue-600">
                  {Math.floor(totalWithMods / 12)}'{totalWithMods % 12}"
                </span>
              </div>
            )}
          </div>
          
          {vehicle.warning && (
            <div className="mt-2 text-xs text-orange-600 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {vehicle.warning}
            </div>
          )}
        </div>
        
        <button 
          onClick={onSelect}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Select
        </button>
      </div>
    </div>
  );
}

// Vehicle Portfolio Modal
function VehiclePortfolioModal({ vehicle, onClose, onUseVehicle }) {
  const [selectedMods, setSelectedMods] = useState([]);
  
  const toggleMod = (modName) => {
    if (modName === 'None') {
      setSelectedMods([]);
      return;
    }
    
    setSelectedMods(prev => {
      if (prev.includes(modName)) {
        return prev.filter(m => m !== modName);
      } else {
        return [...prev, modName];
      }
    });
  };

  const calculateTotal = () => {
    let total = vehicle.baseHeight;
    selectedMods.forEach(modName => {
      const mod = vehicle.typicalMods.find(m => m.name === modName);
      if (mod) total += mod.height;
    });
    return total;
  };

  const totalHeight = calculateTotal();
  const totalFeet = Math.floor(totalHeight / 12);
  const totalInches = totalHeight % 12;

  const handleUseThisVehicle = () => {
    // Create a result object similar to AI analysis
    const vehicleData = {
      vehicle_type: vehicle.name,
      base_height_inches: vehicle.baseHeight,
      total_height_inches: totalHeight,
      total_height: {
        inches: totalHeight,
        feet_inches: `${totalFeet}'${totalInches}"`
      },
      roof_items: vehicle.typicalMods
        .filter(mod => mod.name !== 'None' && selectedMods.includes(mod.name))
        .map(mod => ({
          item: mod.name,
          description: 'Selected from vehicle library',
          estimated_height_added: mod.height
        })),
      clearance_recommendations: {
        minimum_safe_bridge: totalHeight + 6,
        comfort_margin: `We recommend avoiding bridges under ${Math.floor((totalHeight + 6) / 12)}'${(totalHeight + 6) % 12}" for safety.`
      },
      warnings: totalHeight > 162 ? ['Vehicle height exceeds 13\'6" - extreme caution required'] : [],
      confidence: {
        overall: 1.0
      }
    };
    onUseVehicle(vehicleData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{vehicle.name}</h2>
            <p className="text-gray-600 mt-1">{vehicle.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vehicle Image Placeholder */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-12 text-center">
            <Truck className="w-24 h-24 text-blue-600 mx-auto mb-4" />
            <p className="text-blue-900 font-medium">{vehicle.name}</p>
          </div>

          {/* Base Specs */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <Ruler className="w-5 h-5 mr-2" />
              Base Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Base Height</p>
                <p className="text-2xl font-bold text-gray-900">{vehicle.heightDisplay}</p>
                <p className="text-sm text-gray-500">{vehicle.baseHeight} inches</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Common Use</p>
                <p className="text-lg font-semibold text-gray-900">{vehicle.commonUse || 'General purpose'}</p>
              </div>
            </div>
          </div>

          {/* Modifications */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Typical Roof Equipment
            </h3>
            <div className="space-y-2">
              {vehicle.typicalMods.map((mod, idx) => (
                <label
                  key={idx}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    mod.name === 'None'
                      ? selectedMods.length === 0
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                      : selectedMods.includes(mod.name)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={mod.name === 'None' ? selectedMods.length === 0 : selectedMods.includes(mod.name)}
                      onChange={() => toggleMod(mod.name)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      disabled={mod.name === 'None' && selectedMods.length > 0}
                    />
                    <span className="ml-3 font-medium text-gray-900">{mod.name}</span>
                  </div>
                  <span className={`font-bold ${mod.height > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {mod.height > 0 ? `+${mod.height}"` : '—'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Total Height Calculation */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white text-center">
            <p className="text-blue-100 mb-2">Total Vehicle Height</p>
            <p className="text-5xl font-bold mb-2">{totalFeet}'{totalInches}"</p>
            <p className="text-xl text-blue-100">{totalHeight} inches</p>
            {selectedMods.length > 0 && (
              <p className="text-sm text-blue-100 mt-3">
                Base {vehicle.heightDisplay} + {selectedMods.length} modification{selectedMods.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Warning */}
          {(vehicle.warning || totalHeight > 162) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">Safety Warning</p>
                <p className="text-sm text-orange-800 mt-1">
                  {vehicle.warning || 'This vehicle height requires careful route planning to avoid low bridges.'}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleUseThisVehicle}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Use This Vehicle Profile
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Results Display
function ResultsDisplay({ result, navigate }) {
  // Extract from nested structure (backend returns measurements.total_height_inches)
  const measurements = result.measurements || {};
  const vehicleAnalysis = result.vehicle_analysis || {};
  
  const totalHeight = measurements.total_height_inches || 
                      result.total_height?.inches || 
                      result.total_height_inches ||
                      156; // Default: 13'0" (typical box truck)
  
  const baseHeight = measurements.base_height_inches || 
                     result.base_height?.inches || 
                     result.base_height_inches ||
                     144; // Default: 12'0"
  
  const roofEquipment = measurements.roof_equipment || 
                        result.roof_items || 
                        [];
  
  const vehicleType = vehicleAnalysis.type || 
                      result.vehicle_type || 
                      'Commercial Vehicle';
  
  const feetInches = result.total_height?.feet_inches || 
                     `${Math.floor(totalHeight / 12)}'${totalHeight % 12}"`;
  
  const confidence = vehicleAnalysis.confidence || 
                     measurements.confidence || 
                     0.75; // Default 75% confidence
  
  console.log('ResultsDisplay - Parsed data:', { 
    totalHeight,
    baseHeight,
    roofEquipment,
    vehicleType,
    feetInches,
    confidence,
    rawResult: result
  });
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Success Header */}
      <div className="flex items-center mb-6">
        <div className="bg-green-100 p-2 rounded-lg mr-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vehicle Measured</h2>
          <p className="text-sm text-gray-600">Analysis complete with AI</p>
        </div>
      </div>

      {/* Main Height Display */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-6 text-center">
        <p className="text-sm font-medium text-blue-800 mb-2">Total Vehicle Height</p>
        <p className="text-5xl font-bold text-blue-900 mb-2">{feetInches}</p>
        <p className="text-lg text-blue-700">{totalHeight} inches</p>
        
        {result.total_height?.range_min && (
          <p className="text-sm text-blue-600 mt-2">
            Range: {result.total_height.range_min}" - {result.total_height.range_max}"
          </p>
        )}
      </div>

      {/* Breakdown */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 mb-3">Height Breakdown</h3>
        
        <div className="space-y-3">
          {/* Base Vehicle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{vehicleType}</p>
              <p className="text-sm text-gray-600">Base vehicle</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">
                {baseHeight}"
              </span>
              <p className="text-xs text-gray-500">
                Confidence: {Math.round(confidence * 100)}%
              </p>
            </div>
          </div>

          {/* Roof Equipment */}
          {roofEquipment.length > 0 ? (
            roofEquipment.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                <div>
                  <p className="font-medium text-gray-900">{item.item}</p>
                  <p className="text-sm text-gray-600">{item.description || 'Roof equipment'}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-orange-600">
                    +{item.height_added_inches || item.estimated_height_added || 8}"
                  </span>
                  {item.confidence && (
                    <p className="text-xs text-gray-500">
                      {Math.round((item.confidence || 0.8) * 100)}% confident
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 text-center">
              No roof equipment detected
            </div>
          )}
        </div>
      </div>

      {/* Clearance Recommendations */}
      {result.clearance_recommendations && (
        <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
          <h3 className="font-bold text-yellow-900 mb-2 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Clearance Recommendations
          </h3>
          <p className="text-sm text-yellow-800 mb-2">
            Minimum safe bridge: <span className="font-bold">
              {result.clearance_recommendations.minimum_safe_bridge}"
            </span>
          </p>
          <p className="text-sm text-yellow-800">
            {result.clearance_recommendations.comfort_margin}
          </p>
        </div>
      )}

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <h3 className="font-bold text-red-900 mb-2 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Important Warnings
          </h3>
          <ul className="space-y-1">
            {result.warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-red-800">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Confidence: {((result.confidence?.overall || result.confidence) * 100).toFixed(0)}%
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button 
          onClick={() => console.log('Save Profile clicked - Feature coming soon!')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Save Profile
        </button>
        <button 
          onClick={() => {
            console.log('=== PLAN ROUTE BUTTON CLICKED ===');
            console.log('Navigate function:', navigate);
            console.log('Total height:', totalHeight);
            console.log('Vehicle type:', vehicleType);
            
            if (!navigate) {
              console.error('ERROR: navigate is undefined!');
              alert('Navigation error - please refresh the page');
              return;
            }
            
            try {
              console.log('Calling navigate to /plan-route...');
              navigate('/plan-route', { 
                state: { 
                  vehicleHeight: totalHeight,
                  vehicleType: vehicleType,
                  fromMeasurement: true
                } 
              });
              console.log('Navigation successful!');
            } catch (err) {
              console.error('Navigation error:', err);
              alert('Failed to navigate: ' + err.message);
            }
          }}
          className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
        >
          Plan Route
        </button>
      </div>
    </div>
  );
}

// Analyzing State
function AnalyzingState() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing with AI...</h3>
      <p className="text-gray-600">
        Nemotron is measuring your vehicle height and detecting all roof equipment.
      </p>
      <div className="mt-6 space-y-2 text-sm text-gray-500 text-left max-w-md mx-auto">
        <p>✓ Identifying vehicle type</p>
        <p>✓ Detecting roof-mounted equipment</p>
        <p>✓ Calculating total height</p>
        <p>✓ Assessing measurement confidence</p>
      </div>
    </div>
  );
}

// Error State
function ErrorState({ message }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
      <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

// Tips Display (when no result)
function TipsDisplay() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Why Measure Your Vehicle?</h3>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="bg-red-100 p-2 rounded-lg mr-3 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-1">Prevent Costly Strikes</p>
            <p className="text-sm text-gray-600">
              Bridge strikes cost $50,000-$500,000 each. Most drivers don't know their actual height.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="bg-blue-100 p-2 rounded-lg mr-3 flex-shrink-0">
            <Camera className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-1">AI Detects Roof Equipment</p>
            <p className="text-sm text-gray-600">
              AC units, antennas, and ladder racks add 4-12 inches you might not account for.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="bg-green-100 p-2 rounded-lg mr-3 flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-1">Accurate in Seconds</p>
            <p className="text-sm text-gray-600">
              Our AI analyzes your photo and provides height with 90%+ confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Example Results */}
      <div className="mt-6 border-t pt-6">
        <h4 className="font-bold text-gray-900 mb-3">Common Findings</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="text-gray-700">U-Haul 15' (base)</span>
            <span className="font-bold text-gray-900">12'6"</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
            <span className="text-gray-700">+ Roof AC unit</span>
            <span className="font-bold text-orange-600">+8"</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
            <span className="text-gray-700">+ CB antenna</span>
            <span className="font-bold text-orange-600">+4"</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-blue-100 rounded border-2 border-blue-400">
            <span className="font-bold text-blue-900">Total Height</span>
            <span className="text-lg font-bold text-blue-900">13'6"</span>
          </div>
        </div>
      </div>
    </div>
    );
}