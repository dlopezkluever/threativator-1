import React, { useState } from 'react'

type ContactRole = 'witness' | 'consequence_target'

interface Contact {
  id: string
  name: string
  email: string
  roles: ContactRole[]
  verified: boolean
}

interface NewContact {
  name: string
  email: string
  roles: ContactRole[]
}

interface ContactManagementTestStepProps {
  onComplete: (contactIds: string[]) => void
  onError: (error: string) => void
}

const ContactManagementTestStep: React.FC<ContactManagementTestStepProps> = ({ onComplete, onError }) => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [newContact, setNewContact] = useState<NewContact>({
    name: '',
    email: '',
    roles: []
  })
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    return emailRegex.test(email)
  }

  const toggleRole = (role: ContactRole) => {
    setNewContact(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  const addContact = () => {
    if (!newContact.name.trim()) {
      onError('Please enter a contact name')
      return
    }

    if (!validateEmail(newContact.email)) {
      onError('Please enter a valid email address')
      return
    }

    if (newContact.roles.length === 0) {
      onError('Please select at least one role for the contact')
      return
    }

    // Check for duplicate email
    if (contacts.some(c => c.email.toLowerCase() === newContact.email.toLowerCase())) {
      onError('This email address is already added')
      return
    }

    const contact: Contact = {
      id: crypto.randomUUID(),
      name: newContact.name.trim(),
      email: newContact.email.toLowerCase().trim(),
      roles: newContact.roles,
      verified: false
    }

    setContacts(prev => [...prev, contact])
    setNewContact({ name: '', email: '', roles: [] })
    setIsAdding(false)
  }

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  const updateContactRoles = (id: string, role: ContactRole, add: boolean) => {
    setContacts(prev => prev.map(contact => {
      if (contact.id === id) {
        const newRoles = add
          ? [...contact.roles, role]
          : contact.roles.filter(r => r !== role)
        
        return { ...contact, roles: newRoles }
      }
      return contact
    }))
  }

  const saveContacts = async () => {
    if (contacts.length === 0) {
      onError('Please add at least one contact')
      return
    }

    setIsSaving(true)

    // Simulate saving delay
    setTimeout(() => {
      const contactIds = contacts.map(c => c.id)
      onComplete(contactIds)
      setIsSaving(false)
    }, 1500)
  }

  const getRoleDisplayName = (role: ContactRole): string => {
    switch (role) {
      case 'witness':
        return 'Witness'
      case 'consequence_target':
        return 'Consequence Target'
      default:
        return role
    }
  }

  const getRoleDescription = (role: ContactRole): string => {
    switch (role) {
      case 'witness':
        return 'Can verify your progress on goals (they will receive verification emails)'
      case 'consequence_target':
        return 'Will receive embarrassing content if you fail (they do NOT need an account)'
      default:
        return ''
    }
  }

  return (
    <div className="w-full max-w-none">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h4 className="text-sm font-medium text-blue-800 mb-2">🧪 Test Mode</h4>
        <p className="text-sm text-blue-700">
          Contacts are saved locally in test mode. No emails will be sent.
        </p>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          👥 Contact Management
        </h2>
        <p className="text-gray-600 mb-2">
          Add people who can witness your progress or receive consequences if you fail.
        </p>
        <div className="bg-green-50 p-3 rounded-md">
          <p className="text-sm text-green-700">
            ✅ <strong>Important:</strong> Contacts do NOT need Threativator accounts! They'll receive verification emails when needed.
          </p>
        </div>
      </div>

      {/* Existing Contacts */}
      {contacts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Contacts</h3>
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{contact.name}</h4>
                      {!contact.verified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Will be notified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{contact.email}</p>
                    
                    {/* Role toggles */}
                    <div className="space-y-2">
                      {(['witness', 'consequence_target'] as ContactRole[]).map(role => (
                        <label key={role} className="flex items-start">
                          <input
                            type="checkbox"
                            checked={contact.roles.includes(role)}
                            onChange={(e) => updateContactRoles(contact.id, role, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">
                              {getRoleDisplayName(role)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getRoleDescription(role)}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeContact(contact.id)}
                    className="ml-4 p-2 text-red-600 hover:text-red-800"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Contact */}
      {!isAdding ? (
        <div className="text-center mb-8">
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ➕ Add Contact
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Contact</h3>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                id="contact-name"
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="contact-email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                This person does NOT need a Threativator account
              </p>
            </div>

            {/* Roles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Roles * (Select at least one)
              </label>
              <div className="space-y-3">
                {(['witness', 'consequence_target'] as ContactRole[]).map(role => (
                  <label key={role} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={newContact.roles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">
                        {getRoleDisplayName(role)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRoleDescription(role)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={addContact}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Contact
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewContact({ name: '', email: '', roles: [] })
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Save Contacts */}
      {contacts.length > 0 && (
        <div className="text-center">
          <button
            onClick={saveContacts}
            disabled={isSaving}
            className="bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving contacts...
              </div>
            ) : (
              'Save Contacts'
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Contacts will receive verification emails when needed
          </p>
        </div>
      )}

      {/* Skip Option */}
      <div className="mt-6 text-center">
        <button
          onClick={() => onComplete([])}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          Skip for now (you can add contacts later)
        </button>
      </div>
    </div>
  )
}

export default ContactManagementTestStep