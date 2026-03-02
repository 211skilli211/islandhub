import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TypeBadge from '@/components/TypeBadge';

describe('TypeBadge Component', () => {
  it('renders product badge correctly', () => {
    render(<TypeBadge type="product" />);
    const badge = screen.getByText('Product');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');
  });

  it('renders campaign badge correctly', () => {
    render(<TypeBadge type="campaign" />);
    const badge = screen.getByText('Campaign');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  it('renders rental badge correctly', () => {
    render(<TypeBadge type="rental" />);
    const badge = screen.getByText('Rental');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-purple-100');
    expect(badge).toHaveClass('text-purple-800');
  });

  it('renders service badge correctly', () => {
    render(<TypeBadge type="service" />);
    const badge = screen.getByText('Service');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-orange-100');
    expect(badge).toHaveClass('text-orange-800');
  });

  it('handles unknown type with default styling', () => {
    render(<TypeBadge type="unknown" />);
    const badge = screen.getByText('unknown');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-800');
  });

  it('handles empty string type', () => {
    const { container } = render(<TypeBadge type="" />);
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveTextContent('');
  });

  it('has correct base styling classes', () => {
    render(<TypeBadge type="product" />);
    const badge = screen.getByText('Product');
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-medium');
  });
});
