import { Component, type ErrorInfo, type ReactNode } from "react"
import { AdminErrorFallback } from "@/components/admin/AdminErrorFallback"

interface IAdminErrorBoundaryProps {
  children: ReactNode
}

interface IAdminErrorBoundaryState {
  hasError: boolean
  message?: string
}

export class AdminErrorBoundary extends Component<
  IAdminErrorBoundaryProps,
  IAdminErrorBoundaryState
> {
  state: IAdminErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): IAdminErrorBoundaryState {
    const message = error.message.includes("Forbidden")
      ? "You don't have access to this section. Try signing out and back in with the right PIN."
      : error.message.includes("Unauthorized")
        ? "Your session expired. Sign in again."
        : error.message
    return { hasError: true, message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Admin page error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return <AdminErrorFallback message={this.state.message} />
    }
    return this.props.children
  }
}
