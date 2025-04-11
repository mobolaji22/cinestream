"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod" // Add zod for validation

type User = {
  id: string
  name: string
  email: string
  avatar?: string
  memberSince: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

// Create validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
})

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
})

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
        
        // Create a test user if no users exist
        let users = []
        try {
          const storedUsers = localStorage.getItem("users")
          users = storedUsers ? JSON.parse(storedUsers) : []
        } catch (e) {
          console.error("Error parsing users from localStorage:", e)
          users = []
        }
        
        if (users.length === 0) {
          const testUser = {
            id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            avatar: '/placeholder.svg?height=80&width=80',
            memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          }
          users.push(testUser)
          localStorage.setItem("users", JSON.stringify(users))
          console.log("Created test user: test@example.com / password123")
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Validate input
      const result = loginSchema.safeParse({ email, password })
      if (!result.success) {
        console.error("Validation error:", result.error)
        return false
      }
      
      // In a real app, you would make an API call to your backend
      // For this demo, we'll check against localStorage for registered users
      let users = []
      try {
        const storedUsers = localStorage.getItem("users")
        users = storedUsers ? JSON.parse(storedUsers) : []
      } catch (e) {
        console.error("Error parsing users from localStorage:", e)
        users = []
      }
      
      console.log("Attempting login with:", email)
      console.log("Available users:", users)
      
      const foundUser = users.find((u: any) => 
        u.email === email && u.password === password
      )
      
      if (!foundUser) {
        console.log("User not found or password incorrect")
        return false
      }
      
      // Remove password before storing in state
      const { password: _, ...userWithoutPassword } = foundUser
      
      setUser(userWithoutPassword)
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Validate input
      const result = registerSchema.safeParse({ name, email, password })
      if (!result.success) {
        console.error("Validation error:", result.error)
        return false
      }
      
      // Check if user already exists
      let users = []
      try {
        const storedUsers = localStorage.getItem("users")
        users = storedUsers ? JSON.parse(storedUsers) : []
      } catch (e) {
        console.error("Error parsing users from localStorage:", e)
        users = []
      }
      
      if (users.some((u: any) => u.email === email)) {
        console.error("User already exists")
        return false
      }
      
      // Create new user with a safe UUID generation
      const newUser = {
        id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        password, // In a real app, this would be hashed
        avatar: '/placeholder.svg?height=80&width=80',
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }
      
      console.log("Creating new user:", { ...newUser, password: '***' })
      
      // Save to "database"
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))
      
      // Remove password before storing in state
      const { password: _, ...userWithoutPassword } = newUser
      
      setUser(userWithoutPassword)
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}