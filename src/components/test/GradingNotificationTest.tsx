import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import GradingResultModal from '../modals/GradingResultModal'

interface MockGradingResult {
  id: string
  submissionId: string
  status: 'passed' | 'failed'
  feedbackText: string
  confidenceScore?: number
  aiAnalysisResult?: any
  submissionType: 'file_upload' | 'external_url' | 'text_description'
  submittedAt: string
  gradedAt: string
  checkpointTitle: string
  goalTitle: string
  checkpointId: string
}

const GradingNotificationTest: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [testResult, setTestResult] = useState<MockGradingResult | null>(null)

  const createMockResult = (status: 'passed' | 'failed'): MockGradingResult => ({
    id: `test-${Date.now()}`,
    submissionId: `submission-${Date.now()}`,
    status,
    feedbackText: status === 'passed'
      ? 'Excellent work! Your submission clearly demonstrates completion of the required objectives. The evidence provided is comprehensive and meets all evaluation criteria.'
      : 'Your submission does not meet the required standards. The evidence provided lacks sufficient detail and does not clearly demonstrate completion of the objectives. Please revise and resubmit with more comprehensive proof.',
    confidenceScore: status === 'passed' ? 0.95 : 0.78,
    submissionType: 'file_upload',
    submittedAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
    gradedAt: new Date().toISOString(),
    checkpointTitle: 'Weekly Progress Report',
    goalTitle: 'Complete Project Phase 1',
    checkpointId: `checkpoint-test-${Date.now()}`
  })

  const testPassedResult = () => {
    const result = createMockResult('passed')
    setTestResult(result)
    setIsModalOpen(true)
    console.log('🧪 Testing PASSED notification:', result)
  }

  const testFailedResult = () => {
    const result = createMockResult('failed')
    setTestResult(result)
    setIsModalOpen(true)
    console.log('🧪 Testing FAILED notification:', result)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setTestResult(null)
    console.log('🧪 Modal closed')
  }

  const handleResubmit = (checkpointId: string) => {
    console.log('🧪 Resubmission requested for checkpoint:', checkpointId)
    alert(`🔄 RESUBMISSION REQUESTED\n\nCheckpoint ID: ${checkpointId}\n\nThis would normally open the submission interface.`)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Grading Notification System Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-gray-600 mb-4">
              This test page allows you to simulate grading result notifications without needing actual submissions.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={testPassedResult}
              variant="success"
              className="flex-1"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">✅</span>
                <span>Test PASSED Result</span>
              </div>
            </Button>

            <Button
              onClick={testFailedResult}
              variant="danger"
              className="flex-1"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">❌</span>
                <span>Test FAILED Result</span>
              </div>
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-bold mb-2">Test Features:</h3>
            <ul className="space-y-1 text-sm">
              <li>✅ Soviet Constructivist modal styling</li>
              <li>✅ Pass/fail status with appropriate colors</li>
              <li>✅ AI feedback display</li>
              <li>✅ Confidence scores</li>
              <li>✅ Submission details and timestamps</li>
              <li>✅ Resubmission button for failed results</li>
              <li>✅ Acknowledgment flow</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <h3 className="font-bold mb-2 text-blue-800">Production Integration:</h3>
            <p className="text-sm text-blue-700">
              In production, these modals are triggered automatically by the{' '}
              <code className="bg-white px-1 rounded">useSubmissionStatusNotifications</code> hook
              when submission status changes from 'grading' to 'passed'/'failed'.
            </p>
          </div>
        </CardContent>
      </Card>

      <GradingResultModal
        isOpen={isModalOpen}
        onClose={handleClose}
        result={testResult}
        onResubmit={handleResubmit}
      />
    </div>
  )
}

export default GradingNotificationTest