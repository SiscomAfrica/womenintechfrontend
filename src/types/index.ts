
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  status: number
  code?: string
}


export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}


export type QuestionType = 'multiple_choice' | 'single_choice' | 'text' | 'rating'

export interface Question {
  id: string
  type: QuestionType
  question: string
  options?: string[]
  required: boolean
  min_rating?: number
  max_rating?: number
}

export interface QuestionSchema {
  questions: Question[]
}

export interface Poll {
  id: string
  session_id: string
  title: string
  question_schema: { [key: string]: any }
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PollListResponse {
  polls: Poll[]
  total: number
}

export interface ActivePollsResponse {
  active_polls: Poll[]
  total: number
}

export interface PollResponseCreate {
  responses: { [key: string]: string | number | string[] }
}

export interface PollResponseUpdate {
  responses: { [key: string]: string | number | string[] }
}

export interface PollResponse {
  id: string
  poll_id: string
  user_id: string
  responses: { [key: string]: any }
  created_at: string
  updated_at: string
}

export interface PollResponseListResponse {
  responses: PollResponse[]
  total: number
}

export interface QuestionResult {
  question_id: string
  question: string
  question_type: QuestionType
  total_responses: number
  results: { [key: string]: any }
}

export interface PollResults {
  poll_id: string
  poll_title: string
  total_participants: number
  question_results: QuestionResult[]
  created_at: string
}

export interface PollQuestion {
  id: string
  question: string
  type: 'single_choice' | 'multiple_choice' | 'rating' | 'text'
  options?: string[]
  min_rating?: number
  max_rating?: number
  required: boolean
}


export type FeedbackQuestionType = 'text' | 'rating' | 'multiple_choice' | 'single_choice'

export interface FeedbackQuestion {
  id: string
  type: FeedbackQuestionType
  question: string
  options?: string[]
  required: boolean
  min_rating?: number
  max_rating?: number
}

export interface FeedbackSchema {
  rating: {
    type: string
    min: number
    max: number
    required: boolean
    label: string
  }
  questions: FeedbackQuestion[]
}

export interface FeedbackCreate {
  responses: { [key: string]: any }
}

export interface FeedbackUpdate {
  responses: { [key: string]: any }
}

export interface FeedbackResponse {
  id: string
  user_id: string
  session_id: string
  feedback_schema: { [key: string]: any }
  responses: { [key: string]: any }
  created_at: string
  updated_at: string
}

export interface FeedbackWithSession extends FeedbackResponse {
  session_title?: string
  session_start?: string
  session_end?: string
}

export interface FeedbackListResponse {
  feedback: FeedbackWithSession[]
  total: number
}

export interface FeedbackSchemaResponse {
  session_id: string
  session_title: string
  feedback_schema: { [key: string]: any }
}

export interface SessionFeedbackSummary {
  session_id: string
  session_title: string
  total_responses: number
  average_rating: number
  rating_distribution: { [key: string]: number }
  question_summaries: { [key: string]: any }[]
}

export interface FeedbackValidationRequest {
  session_id: string
  responses: { [key: string]: any }
}

export interface FeedbackValidationResponse {
  is_valid: boolean
  errors: string[]
  warnings: string[]
}