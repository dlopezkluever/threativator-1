import { supabase } from '../lib/supabase'

export const initializeUserProfile = async (userId: string, email: string) => {
  console.log('🔧 [InitProfile] Creating user profile for:', email)
  
  try {
    // Try to create the user profile in our users table
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: email,
        holding_cell_balance: 0.00,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [InitProfile] Failed to create user profile:', error)
      return false
    }

    console.log('✅ [InitProfile] User profile created successfully:', data)
    return true
  } catch (error) {
    console.error('❌ [InitProfile] Unexpected error:', error)
    return false
  }
}