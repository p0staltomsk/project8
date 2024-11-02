import { BaseProps } from '@/types'
import { X } from 'lucide-react'

interface SettingsPanelProps extends BaseProps {
    isOpen: boolean
    toggleSettings: () => void
}

export default function SettingsPanel({ isOpen, toggleSettings }: SettingsPanelProps) {
    return (
        <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${
                isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
            <div
                className={`absolute right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-lg transform transition-transform ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold dark:text-white">Settings</h2>
                        <button
                            onClick={toggleSettings}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                    <div className="space-y-6">
                        {/* Add settings sections here */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium dark:text-gray-200">Editor</h3>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" className="form-checkbox" />
                                    <span className="text-sm dark:text-gray-300">Show line numbers</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" className="form-checkbox" />
                                    <span className="text-sm dark:text-gray-300">Enable minimap</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
