import React, { useState, useEffect } from 'react'
import BaseModal from './BaseModal'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Trash2, Edit, UserPlus, Users, Mail, Shield, Target } from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  roles: string[]
  verified: boolean
  created_at: string
  updated_at: string
}

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()

  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roles: [] as string[]
  })

  const AVAILABLE_ROLES = [
    { value: 'witness', label: 'Witness', description: 'Can grade submissions for human-witness goals', icon: Shield },
    { value: 'consequence_target', label: 'Consequence Target', description: 'Receives kompromat if user fails goals', icon: Target }
  ]

  // Fetch contacts when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchContacts()
    }
  }, [isOpen, user])

  // Reset form when switching modes
  useEffect(() => {
    if (viewMode === 'add') {
      setFormData({ name: '', email: '', roles: [] })
    }
  }, [viewMode])

  const fetchContacts = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
      showError('Failed to load contacts')
    } finally {
      setIsLoading(false)
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      showError('Name is required')
      return
    }

    if (!formData.email.trim()) {
      showError('Email is required')
      return
    }

    if (!validateEmail(formData.email)) {
      showError('Invalid email format')
      return
    }

    if (formData.roles.length === 0) {
      showError('At least one role must be selected')
      return
    }

    // Check for duplicate email (excluding current contact if editing)
    const existingContact = contacts.find(c => 
      c.email.toLowerCase() === formData.email.toLowerCase() && 
      c.id !== editingContact?.id
    )
    
    if (existingContact) {
      showError('A contact with this email already exists')
      return
    }

    try {
      setIsLoading(true)

      if (editingContact) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update({
            name: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            roles: formData.roles,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingContact.id)

        if (error) throw error
        showSuccess('Contact updated successfully')
      } else {
        // Create new contact
        const { error } = await supabase
          .from('contacts')
          .insert({
            user_id: user?.id,
            name: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            roles: formData.roles,
            verified: false
          })

        if (error) throw error
        showSuccess('Contact added successfully')
      }

      fetchContacts()
      setViewMode('list')
      setEditingContact(null)
    } catch (error) {
      console.error('Failed to save contact:', error)
      showError('Failed to save contact')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      email: contact.email,
      roles: contact.roles
    })
    setViewMode('edit')
  }

  const handleDelete = async (contact: Contact) => {
    if (!confirm(`DELETE AGENT RECORD: "${contact.name}"?\n\nThis will remove them from all surveillance networks.\nOperation cannot be reversed, Comrade.`)) {
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contact.id)

      if (error) throw error
      
      showSuccess('Contact deleted successfully')
      fetchContacts()
    } catch (error) {
      console.error('Failed to delete contact:', error)
      showError('Failed to delete contact')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleIcon = (role: string) => {
    const roleConfig = AVAILABLE_ROLES.find(r => r.value === role)
    if (!roleConfig) return <Users className="h-4 w-4" />
    const Icon = roleConfig.icon
    return <Icon className="h-4 w-4" />
  }

  const getRoleLabel = (role: string) => {
    const roleConfig = AVAILABLE_ROLES.find(r => r.value === role)
    return roleConfig?.label || role
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="👥 AGENT NETWORK" size="large">
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'command' : 'ghost'}
            onClick={() => setViewMode('list')}
          >
            AGENT LIST ({contacts.length})
          </Button>
          <Button
            variant={viewMode === 'add' ? 'command' : 'ghost'}
            onClick={() => setViewMode('add')}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            RECRUIT AGENT
          </Button>
        </div>

        {viewMode === 'list' ? (
          <>
            {/* Search */}
            {contacts.length > 0 && (
              <div>
                <input
                  type="text"
                  placeholder="Search agents by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
                    w-full p-3
                    border-[2px]
                    border-[var(--color-accent-black)]
                    bg-white
                    text-[var(--color-text-primary)]
                    font-[var(--font-family-body)]
                  "
                />
              </div>
            )}

            {/* Contacts List */}
            <Card>
              <CardHeader>
                <CardTitle>ACTIVE AGENTS ({filteredContacts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-crimson)] mx-auto"></div>
                    <p className="text-[var(--color-text-primary)] mt-2 uppercase" style={{color: 'var(--color-text-primary)'}}>
                      ACCESSING AGENT DATABASE...
                    </p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-[var(--color-text-primary)] opacity-30 mb-4" />
                    <p className="text-[var(--color-text-primary)] uppercase font-bold" style={{color: 'var(--color-text-primary)'}}>
                      {contacts.length === 0 ? 'NO AGENTS RECRUITED' : 'NO AGENTS MATCH SEARCH'}
                    </p>
                    <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)] mt-2" style={{color: 'var(--color-text-primary)'}}>
                      {contacts.length === 0 ? 'Recruit agents to enable accountability mechanisms' : 'Try different search terms'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredContacts.map((contact) => (
                      <div key={contact.id} className="
                        border-[2px]
                        border-[var(--color-accent-black)]
                        bg-white
                        p-4
                      ">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                                {contact.name}
                              </h3>
                              {!contact.verified && (
                                <span className="
                                  text-[var(--font-size-xs)] 
                                  bg-[var(--color-primary-crimson)]
                                  text-white 
                                  px-2 py-1 
                                  uppercase 
                                  font-bold
                                ">
                                  UNVERIFIED
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <Mail className="h-4 w-4 text-[var(--color-text-primary)]" />
                              <span className="text-[var(--color-text-primary)] text-[var(--font-size-sm)]" style={{color: 'var(--color-text-primary)'}}>
                                {contact.email}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {contact.roles.map((role) => (
                                <div key={role} className="
                                  flex items-center gap-1
                                  bg-[var(--color-background-beige)]
                                  border-[1px]
                                  border-[var(--color-accent-black)]
                                  px-2 py-1
                                  text-[var(--font-size-xs)]
                                  uppercase
                                  font-bold
                                ">
                                  {getRoleIcon(role)}
                                  {getRoleLabel(role)}
                                </div>
                              ))}
                            </div>

                            <p className="text-[var(--font-size-xs)] text-[var(--color-text-primary)] mt-2" style={{color: 'var(--color-text-primary)'}}>
                              Recruited: {new Date(contact.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(contact)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(contact)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          /* Add/Edit Form */
          <Card>
            <CardHeader>
              <CardTitle>
                {viewMode === 'edit' ? 'MODIFY AGENT RECORD' : 'RECRUIT NEW AGENT'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-[var(--font-size-sm)] font-bold uppercase mb-2 text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                    AGENT NAME (REQUIRED):
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="
                      w-full p-3
                      border-[2px]
                      border-[var(--color-accent-black)]
                      bg-white
                      text-[var(--color-text-primary)]
                      font-[var(--font-family-body)]
                    "
                    placeholder="Enter agent's full name..."
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-[var(--font-size-sm)] font-bold uppercase mb-2 text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                    EMAIL ADDRESS (REQUIRED):
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="
                      w-full p-3
                      border-[2px]
                      border-[var(--color-accent-black)]
                      bg-white
                      text-[var(--color-text-primary)]
                      font-[var(--font-family-body)]
                    "
                    placeholder="Enter agent's email address..."
                  />
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-[var(--font-size-sm)] font-bold uppercase mb-2 text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                    OPERATIONAL ROLES (SELECT AT LEAST ONE):
                  </label>
                  <div className="space-y-3">
                    {AVAILABLE_ROLES.map((role) => {
                      const Icon = role.icon
                      const isSelected = formData.roles.includes(role.value)
                      return (
                        <div key={role.value} className="
                          border-[2px]
                          border-[var(--color-accent-black)]
                          bg-white
                          p-3
                        ">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRole(role.value)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="h-5 w-5 text-[var(--color-text-primary)]" />
                                <span className="font-bold text-[var(--color-text-primary)] uppercase" style={{color: 'var(--color-text-primary)'}}>
                                  {role.label}
                                </span>
                              </div>
                              <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)]" style={{color: 'var(--color-text-primary)'}}>
                                {role.description}
                              </p>
                            </div>
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="command"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        PROCESSING...
                      </div>
                    ) : viewMode === 'edit' ? (
                      'UPDATE AGENT'
                    ) : (
                      'RECRUIT AGENT'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setViewMode('list')
                      setEditingContact(null)
                    }}
                  >
                    CANCEL
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Info Footer */}
        <div className="
          bg-[var(--color-background-beige)]
          border-[2px]
          border-[var(--color-accent-black)]
          p-4
          text-center
        ">
          <p className="text-[var(--font-size-sm)] text-[var(--color-text-primary)] uppercase font-bold" style={{color: 'var(--color-text-primary)'}}>
            🔐 ALL AGENT DATA ENCRYPTED WITH MILITARY-GRADE SECURITY
          </p>
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-primary)] mt-1" style={{color: 'var(--color-text-primary)'}}>
            Agents will receive verification emails before operational deployment
          </p>
        </div>
      </div>
    </BaseModal>
  )
}

export default ContactModal