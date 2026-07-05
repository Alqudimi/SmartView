import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReceiverSimulator from '../components/ReceiverSimulator';

vi.mock('lucide-react', () => {
  return {
    Tv: () => <svg data-testid="tv-icon" />,
    Settings: () => <svg data-testid="settings-icon" />,
    MonitorPlay: () => <svg data-testid="monitor-play-icon" />,
    Wifi: () => <svg data-testid="wifi-icon" />,
    Play: () => <svg data-testid="play-icon" />,
    Square: () => <svg data-testid="square-icon" />,
    Volume2: () => <svg data-testid="volume-icon" />,
    VolumeX: () => <svg data-testid="volume-x-icon" />,
    Laptop: () => <svg data-testid="laptop-icon" />,
    Smartphone: () => <svg data-testid="smartphone-icon" />,
    Loader2: () => <svg data-testid="loader-icon" />,
    CheckCircle: () => <svg data-testid="check-icon" />,
    AlertTriangle: () => <svg data-testid="alert-icon" />,
    Info: () => <svg data-testid="info-icon" />
  };
});

describe('ReceiverSimulator', () => {
  it('renders correctly with default props', () => {
    render(<ReceiverSimulator isArabic={false} />);
    expect(screen.getByText(/Living Room SmartTV/i)).toBeInTheDocument();
  });

  it('can toggle settings', () => {
    render(<ReceiverSimulator isArabic={false} />);
    const settingsButton = screen.getByText(/Wireless Settings/i);
    expect(settingsButton).toBeInTheDocument();
    
    fireEvent.click(settingsButton);
    expect(screen.getByText(/Receiver Device Name:/i)).toBeInTheDocument();
    expect(screen.getByText(/WPA2 PIN Authentication:/i)).toBeInTheDocument();
  });

  it('starts the simulator server', () => {
    render(<ReceiverSimulator isArabic={false} />);
    const startButton = screen.getByText(/Activate Receiver/i);
    fireEvent.click(startButton);
    
    expect(screen.getByText(/Initializing.../i)).toBeInTheDocument();
  });
});
