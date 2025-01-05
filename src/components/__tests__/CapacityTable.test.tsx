import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CapacityTable } from '../molecules/CapacityTable';

describe('CapacityTable', () => {
  const mockData = [{
    collaborator: 'Test User',
    availableHours: 160,
    estimatedHours: 120,
    chargedHours: 100,
    realLoadPercentage: 62.5,
    plannedLoadPercentage: 75,
    vacationDays: 0,
    otherAbsences: 0
  }];

  it('renders all columns', () => {
    render(<CapacityTable data={mockData} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('160.0')).toBeInTheDocument();
    expect(screen.getByText('120.0')).toBeInTheDocument();
    expect(screen.getByText('100.0')).toBeInTheDocument();
  });

  it('handles empty data', () => {
    render(<CapacityTable data={[]} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});