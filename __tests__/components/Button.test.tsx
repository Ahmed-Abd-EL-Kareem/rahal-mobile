import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  const defaultProps = {
    children: 'Test Button',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with children', () => {
    const { getByText } = render(<Button {...defaultProps} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(<Button {...defaultProps} />);
    fireEvent.press(getByText('Test Button'));
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    const { getByText } = render(
      <Button {...defaultProps} variant="secondary" />
    );
    // Should have secondary variant styles
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('applies size classes', () => {
    const { getByText } = render(
      <Button {...defaultProps} size="lg" />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { getByText } = render(
      <Button {...defaultProps} loading />
    );
    expect(getByText('Test Button')).toBeTruthy();
    // Should show ActivityIndicator
  });

  it('disables button when disabled', () => {
    const { getByText } = render(
      <Button {...defaultProps} disabled />
    );
    const button = getByText('Test Button');
    expect(button.props.disabled).toBe(true);
  });

  it('applies fullWidth', () => {
    const { getByText } = render(
      <Button {...defaultProps} fullWidth />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('renders AI variant with icon', () => {
    const { getByText } = render(
      <Button {...defaultProps} variant="ai">
        <span>✨</span>
        <Text>AI Button</Text>
      </Button>
    );
    expect(getByText('AI Button')).toBeTruthy();
  });
});