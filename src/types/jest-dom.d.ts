/// <reference types="@testing-library/jest-dom" />

declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveClass(className: string): R;
    toHaveStyle(style: { [key: string]: any }): R;
  }
}
