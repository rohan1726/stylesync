import { useTokenStore } from './store/tokenStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Landing } from './components/Landing';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ErrorBanner } from './components/ErrorBanner';
import { ColorEditor } from './components/editors/ColorEditor';
import { TypographyEditor } from './components/editors/TypographyEditor';
import { SpacingEditor } from './components/editors/SpacingEditor';
import { PreviewGrid } from './components/preview/PreviewGrid';
import { VersionTimeline } from './components/history/VersionTimeline';
import { ExportPanel } from './components/export/ExportPanel';
import './index.css';

function App() {
  const { extractionStatus, activeSection } = useTokenStore();

  if (extractionStatus === 'idle') {
    return (
      <>
        <div className="app-layout app-layout--landing">
          <Header />
          <main className="main-content">
            <Landing />
          </main>
        </div>
      </>
    );
  }

  if (extractionStatus === 'scraping') {
    return <LoadingOverlay />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'colors':
        return <ColorEditor />;
      case 'typography':
        return <TypographyEditor />;
      case 'spacing':
        return <SpacingEditor />;
      case 'preview':
        return <PreviewGrid />;
      case 'history':
        return <VersionTimeline />;
      case 'export':
        return <ExportPanel />;
      default:
        return <ColorEditor />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <Header />
      <main className="main-content">
        {extractionStatus === 'error' && <ErrorBanner />}
        {renderSection()}
      </main>
    </div>
  );
}

export default App;
