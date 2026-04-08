import { useState, useEffect } from 'react';
import { useTokenStore } from '../store/tokenStore';

const steps = [
  { label: 'Connecting to website', duration: 2000 },
  { label: 'Loading page content', duration: 3000 },
  { label: 'Parsing CSS stylesheets', duration: 2500 },
  { label: 'Extracting color palette', duration: 2000 },
  { label: 'Analyzing typography', duration: 1500 },
  { label: 'Detecting spacing rhythm', duration: 1500 },
  { label: 'Extracting image colors', duration: 2000 },
  { label: 'Building design tokens', duration: 1000 },
];

const domNodes = [
  { indent: 0, tag: '<html>', attrs: 'lang="en"' },
  { indent: 1, tag: '<head>', attrs: '' },
  { indent: 2, tag: '<link>', attrs: 'rel="stylesheet"', value: 'styles.css' },
  { indent: 2, tag: '<meta>', attrs: 'name="viewport"', value: '' },
  { indent: 1, tag: '<body>', attrs: 'class="main"' },
  { indent: 2, tag: '<header>', attrs: 'class="nav"' },
  { indent: 3, tag: '<nav>', attrs: '', value: '3 items' },
  { indent: 2, tag: '<main>', attrs: 'class="content"' },
  { indent: 3, tag: '<h1>', attrs: '', value: 'font-family: found' },
  { indent: 3, tag: '<section>', attrs: 'class="hero"' },
  { indent: 4, tag: '<img>', attrs: 'src="hero.jpg"', value: '→ palette extraction' },
  { indent: 3, tag: '<div>', attrs: 'class="card"', value: 'padding: 24px → spacing token' },
  { indent: 2, tag: '<footer>', attrs: '' },
];

export function LoadingOverlay() {
  const { siteUrl } = useTokenStore();
  const [activeStep, setActiveStep] = useState(0);
  const [visibleNodes, setVisibleNodes] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 2000);

    const nodeTimer = setInterval(() => {
      setVisibleNodes((prev) => Math.min(prev + 1, domNodes.length));
    }, 600);

    return () => {
      clearInterval(stepTimer);
      clearInterval(nodeTimer);
    };
  }, []);

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <h2 className="loading-content__title">Analyzing Design System</h2>
        <p className="loading-content__url">{siteUrl}</p>

        <div className="dom-tree">
          {domNodes.slice(0, visibleNodes).map((node, i) => (
            <div
              key={i}
              className="dom-tree__node"
              style={{
                paddingLeft: `${node.indent * 20}px`,
                animationDelay: `${i * 100}ms`,
              }}
            >
              <span className="dom-tree__node-tag">{node.tag}</span>
              {node.attrs && <span className="dom-tree__node-attr">{node.attrs}</span>}
              {node.value && <span className="dom-tree__node-value">→ {node.value}</span>}
            </div>
          ))}
        </div>

        <div className="loading-steps">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`loading-step ${
                i < activeStep ? 'loading-step--done' : 
                i === activeStep ? 'loading-step--active' : ''
              }`}
            >
              <span className="loading-step__icon">
                {i < activeStep ? '✓' : i === activeStep ? (
                  <span className="loading-step__spinner" />
                ) : '○'}
              </span>
              {step.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
