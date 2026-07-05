import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

vi.mock('lucide-react', () => {
  return {
    MonitorPlay: () => <svg />, Power: () => <svg />, Settings: () => <svg />, HelpCircle: () => <svg />, Copy: () => <svg />, ShieldAlert: () => <svg />, MonitorSmartphone: () => <svg />, ArrowRight: () => <svg />, ArrowLeft: () => <svg />, Smartphone: () => <svg />, Shield: () => <svg />, Video: () => <svg />, Globe: () => <svg />, Square: () => <svg />, Play: () => <svg />, Pause: () => <svg />, Volume2: () => <svg />, VolumeX: () => <svg />, AlertTriangle: () => <svg />, CheckCircle: () => <svg />, Clock: () => <svg />, Wifi: () => <svg />, WifiOff: () => <svg />, Cast: () => <svg />, ScanLine: () => <svg />, Tv: () => <svg />, X: () => <svg />
  };
});
vi.mock('react-qr-code', () => ({ default: () => <svg data-testid="qr-code" /> }));

describe('App', () => {
  it('renders the initial operation mode screen', () => {
    render(<App />);
    expect(screen.getByText(/اختر وضع التشغيل/i)).toBeInTheDocument();
  });
});
