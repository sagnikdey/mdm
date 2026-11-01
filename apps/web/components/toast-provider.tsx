"use client"

import { createContext, useCallback, useContext, useState } from "react"

import { Toast } from "@sagui/ui"

type ToastMessage = { title: string; description?: string }

const ToastContext = createContext<(message: ToastMessage) => void>(() => {})

/** Lives above the routes, so a confirmation survives the navigation that follows a save. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<ToastMessage>({ title: "" })
  const [open, setOpen] = useState(false)

  const showToast = useCallback((next: ToastMessage) => {
    setMessage(next)
    setOpen(true)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="pointer-events-auto w-full max-w-md empty:hidden">
          <Toast
            open={open}
            onOpenChange={setOpen}
            title={message.title}
            description={message.description}
          />
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
