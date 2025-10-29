import * as React from 'react'

// Ensure React and all its hooks are available globally
const ReactWithHooks = {
  ...React,
  useState: React.useState,
  useEffect: React.useEffect,
  useLayoutEffect: React.useLayoutEffect,
  useContext: React.useContext,
  useReducer: React.useReducer,
  useCallback: React.useCallback,
  useMemo: React.useMemo,
  useRef: React.useRef,
  useImperativeHandle: React.useImperativeHandle,
  useDebugValue: React.useDebugValue,
  useDeferredValue: React.useDeferredValue,
  useTransition: React.useTransition,
  useId: React.useId,
  useSyncExternalStore: React.useSyncExternalStore,
  useInsertionEffect: React.useInsertionEffect,
}

// Make React available globally with all hooks
if (typeof globalThis !== 'undefined') {
  ;(globalThis as any).React = ReactWithHooks
}

if (typeof window !== 'undefined') {
  ;(window as any).React = ReactWithHooks
}

export default ReactWithHooks