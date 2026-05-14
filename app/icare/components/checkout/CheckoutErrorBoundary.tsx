'use client';

import React from 'react';
import { Language, checkoutTranslations } from '../../translations';

const CONTROL_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

interface CheckoutErrorBoundaryProps {
  children: React.ReactNode;
  lang: Language;
  onNavigate: (page: string) => void;
}

interface CheckoutErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class CheckoutErrorBoundary extends React.Component<
  CheckoutErrorBoundaryProps,
  CheckoutErrorBoundaryState
> {
  constructor(props: CheckoutErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): CheckoutErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[CheckoutErrorBoundary] Render error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleBackToShop = () => {
    this.setState({ hasError: false, error: null });
    this.props.onNavigate('shop');
  };

  render() {
    if (this.state.hasError) {
      const ct = checkoutTranslations[this.props.lang];
      return (
        <div className="min-h-[60vh] flex items-center justify-center bg-[#FAFAFA] py-16 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-5xl mb-6">⚠️</div>
            <h2 className="text-2xl font-light mb-3">{ct.errorBoundaryTitle}</h2>
            <p className="text-sm text-[#5F5D59] mb-8">
              {ct.errorBoundaryMessage}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className={`w-full px-6 py-3 bg-black text-white rounded-full hover:bg-[#333] transition-colors text-sm font-medium ${CONTROL_FOCUS_CLASS}`}
              >
                {ct.errorBoundaryRetry}
              </button>
              <button
                onClick={this.handleBackToShop}
                className={`w-full px-6 py-3 border border-[#DDD] rounded-full hover:bg-[#FAFAFA] transition-colors text-sm ${CONTROL_FOCUS_CLASS}`}
              >
                {ct.errorBoundaryBack}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
