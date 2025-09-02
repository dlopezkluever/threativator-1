import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Submission {
  id: string
  submission_type: 'file_upload' | 'external_url' | 'text_description'
  file_path?: string
  external_url?: string
  description?: string
  status: 'pending' | 'grading' | 'passed' | 'failed' | 'contested'
  submitted_at: string
  graded_at?: string
  feedback_text?: string
  ai_analysis_result?: any
}

interface Props {
  checkpointId: string
  isOpen: boolean
  onClose: () => void
}

const SubmissionHistory: React.FC<Props> = ({ checkpointId, isOpen, onClose }) => {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all')

  useEffect(() => {
    if (isOpen && user) {
      loadSubmissions()
      setupRealtimeSubscription()
    }
  }, [isOpen, user, checkpointId])

  const loadSubmissions = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('checkpoint_id', checkpointId)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      setSubmissions(data || [])
    } catch (err) {
      console.error('Error loading submissions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    if (!user) return

    const channel = supabase
      .channel(`submissions-${checkpointId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'submissions',
          filter: `checkpoint_id=eq.${checkpointId}`
        }, 
        (payload) => {
          console.log('Submission updated:', payload)
          loadSubmissions() // Refresh the list
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-[var(--color-success-muted)]'
      case 'failed':
        return 'text-[var(--color-primary-crimson)]'
      case 'grading':
        return 'text-orange-600'
      case 'pending':
        return 'text-[var(--color-text-primary)]'
      default:
        return 'text-[var(--color-text-primary)]'
    }
  }

  const getSubmissionIcon = (type: string) => {
    switch (type) {
      case 'file_upload':
        return '📎'
      case 'external_url':
        return '🔗'
      case 'text_description':
        return '📝'
      default:
        return '❓'
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true
    return submission.status === filter
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-[var(--space-4)]">
      <div className="bg-[var(--color-background-beige)] border-[var(--border-width-thick)] border-[var(--color-accent-black)] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-[var(--color-primary-crimson)] p-[var(--space-6)] border-b-[var(--border-width-thick)] border-[var(--color-accent-black)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-[var(--color-background-beige)] font-[var(--font-family-display)] text-[var(--font-size-2xl)] font-bold uppercase mb-2">
                SUBMISSION ARCHIVE
              </h2>
              <p className="text-[var(--color-background-beige)] font-[var(--font-family-body)] text-[var(--font-size-sm)] opacity-90">
                HISTORICAL PROOF SUBMISSIONS
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--color-background-beige)] hover:text-[var(--color-accent-black)] text-[var(--font-size-2xl)] font-bold leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-[var(--space-6)]">
          
          {/* Filters */}
          <div className="mb-[var(--space-6)]">
            <div className="flex gap-[var(--space-2)]">
              {(['all', 'passed', 'failed'] as const).map((filterOption) => (
                <Button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  variant={filter === filterOption ? 'action' : 'ghost'}
                  size="sm"
                  className="text-[var(--font-size-xs)] font-bold uppercase"
                >
                  {filterOption === 'all' ? 'ALL SUBMISSIONS' : filterOption.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-[var(--space-8)]">
              <div className="text-[var(--font-size-4xl)] mb-[var(--space-4)]">⏳</div>
              <p className="font-[var(--font-family-display)] font-bold uppercase">
                LOADING ARCHIVE...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-[var(--space-8)]">
              <div className="text-[var(--font-size-4xl)] mb-[var(--space-4)]">⚠️</div>
              <p className="font-[var(--font-family-display)] font-bold uppercase text-[var(--color-primary-crimson)] mb-2">
                ARCHIVE ACCESS FAILED
              </p>
              <p className="text-[var(--font-size-sm)]">{error}</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-[var(--space-8)]">
              <div className="text-[var(--font-size-4xl)] mb-[var(--space-4)]">📭</div>
              <p className="font-[var(--font-family-display)] font-bold uppercase mb-2">
                NO SUBMISSIONS FOUND
              </p>
              <p className="text-[var(--font-size-sm)] opacity-70">
                {filter === 'all' 
                  ? 'No submissions have been made for this checkpoint yet'
                  : `No ${filter} submissions found`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-[var(--space-4)]">
              {filteredSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-[var(--space-4)]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-[var(--space-3)] flex-1">
                        <div className="text-[var(--font-size-2xl)]">
                          {getSubmissionIcon(submission.submission_type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-[var(--space-3)] mb-2">
                            <span className="font-[var(--font-family-display)] font-bold uppercase text-[var(--font-size-sm)]">
                              {submission.submission_type.replace('_', ' ')}
                            </span>
                            <span className={`font-bold uppercase text-[var(--font-size-sm)] ${getStatusColor(submission.status)}`}>
                              {submission.status}
                            </span>
                          </div>
                          
                          <p className="text-[var(--font-size-sm)] opacity-70 mb-2">
                            Submitted: {formatDate(submission.submitted_at)}
                            {submission.graded_at && (
                              <> • Graded: {formatDate(submission.graded_at)}</>
                            )}
                          </p>

                          {/* Content Preview */}
                          {submission.submission_type === 'external_url' && submission.external_url && (
                            <a
                              href={submission.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--color-primary-crimson)] underline text-[var(--font-size-sm)] block truncate"
                            >
                              {submission.external_url}
                            </a>
                          )}
                          
                          {submission.submission_type === 'text_description' && submission.description && (
                            <p className="text-[var(--font-size-sm)] line-clamp-2 opacity-80">
                              {submission.description.substring(0, 150)}
                              {submission.description.length > 150 ? '...' : ''}
                            </p>
                          )}
                          
                          {submission.submission_type === 'file_upload' && submission.file_path && (
                            <p className="text-[var(--font-size-sm)] opacity-80">
                              File: {submission.file_path.split('/').pop()}
                            </p>
                          )}

                          {/* Feedback */}
                          {submission.feedback_text && (
                            <div className="mt-3 p-[var(--space-3)] bg-gray-50 border border-[var(--color-accent-black)]">
                              <p className="font-bold text-[var(--font-size-sm)] mb-1 uppercase">
                                GRADER FEEDBACK:
                              </p>
                              <p className="text-[var(--font-size-sm)]">
                                {submission.feedback_text}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[var(--color-background-beige)] border-t-[var(--border-width-thick)] border-[var(--color-accent-black)] p-[var(--space-6)]">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-[var(--font-size-sm)] font-bold uppercase"
            >
              CLOSE ARCHIVE
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SubmissionHistory