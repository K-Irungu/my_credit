"use client";

import React, { useState } from "react";
import { FaSave, FaUndo, FaBell, FaDatabase, FaKey } from "react-icons/fa";

const SettingsModule = () => {
  // State for various settings sections
  const [activeTab, setActiveTab] = useState("notifications");
  const [settings, setSettings] = useState({
    notifications: {
      newIssueAlerts: true,
      weeklyReports: true,
    }
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPassword, setExportPassword] = useState("");

  const handleInputChange = (section: string, field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleSaveSettings = () => {
    setLoading(true);
    setSaveStatus("saving");
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSaveStatus("saved");
      
      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus(""), 2000);
    }, 1000);
  };

  const handleResetSettings = () => {
    setSettings({
      notifications: {
        newIssueAlerts: true,
        weeklyReports: true,
      }
    });
  };

  const handleExportData = () => {
    if (exportPassword) {
      // In a real app, this would verify the password and initiate the export
      console.log("Exporting data with password:", exportPassword);
      alert("Data export initiated successfully!");
      setShowExportModal(false);
      setExportPassword("");
    } else {
      alert("Please enter your password to export data.");
    }
  };

  const renderSaveStatus = () => {
    if (saveStatus === "saving") {
      return <span className="text-blue-500 ml-4">Saving...</span>;
    } else if (saveStatus === "saved") {
      return <span className="text-green-500 ml-4">Settings saved successfully!</span>;
    }
    return null;
  };

  return (
    <div className="flex flex-col p-6 bg-white border border-gray-200 rounded-lg min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "notifications"
                ? "border-[#ffde17] text-[#333333]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <FaBell className="inline mr-2" />
            Notifications
          </button>
          {/* <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "data"
                ? "border-[#ffde17] text-[#333333]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("data")}
          >
            <FaDatabase className="inline mr-2" />
            Data Management
          </button> */}
        </nav>
      </div>
      
      {/* Notification Settings */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Notification Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-700">New Issue Alerts</h3>
                <p className="text-sm text-gray-500">Get notified when new issues are reported</p>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.newIssueAlerts}
                    onChange={(e) => handleInputChange("notifications", "newIssueAlerts", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffde17]"></div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-700">Weekly Reports</h3>
                <p className="text-sm text-gray-500">Receive weekly summary reports</p>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.weeklyReports}
                    onChange={(e) => handleInputChange("notifications", "weeklyReports", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffde17]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Data Management Settings
      {activeTab === "data" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Data Management</h2>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 flex items-center">
              <FaKey className="mr-2" /> Data Export
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Export all system data for backup or analysis purposes.
            </p>
            <div className="mt-4">
              <button 
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-[#ffde17] border border-transparent rounded-md shadow-sm text-sm font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
              >
                Export All Data
              </button>
            </div>
          </div>
        </div>
      )} */}
      
      {/* Save buttons */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
        <button
          onClick={handleResetSettings}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          <FaUndo className="mr-2" />
          Reset to Defaults
        </button>
        
        <div className="flex items-center">
          {renderSaveStatus()}
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="ml-4 flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            <FaSave className="mr-2" />
            Save Settings
          </button>
        </div>
      </div>

      {/* Export Data Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaKey className="mr-2" /> Confirm Data Export
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please enter your password to confirm the export of all system data.
            </p>
            
            <div className="mb-4">
              <label htmlFor="exportPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="exportPassword"
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                placeholder="Enter your password"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportPassword("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-[#ffde17] border border-transparent rounded-md text-sm font-medium text-black hover:bg-yellow-500"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModule;