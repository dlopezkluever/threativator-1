import { supabase } from '../lib/supabase'

export const resetUserOnboarding = async (userId: string) => {
  try {
    // Reset onboarding status
    const { error: userError } = await supabase
      .from('users')
      .update({
        onboarding_completed: false,
        stripe_customer_id: null,
        twitter_access_token: null,
        twitter_refresh_token: null,
        twitter_username: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (userError) {
      throw userError
    }

    // Clear related data
    await Promise.all([
      // Delete kompromat files
      supabase.from('kompromat').delete().eq('user_id', userId),
      // Delete contacts
      supabase.from('contacts').delete().eq('user_id', userId)
    ])

    return { success: true }
  } catch (error) {
    console.error('Error resetting onboarding:', error)
    return { success: false, error }
  }
}

// Helper function to check current onboarding status
export const getOnboardingStatus = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('onboarding_completed, stripe_customer_id, twitter_username')
    .eq('id', userId)
    .single()

  return { data, error }
}