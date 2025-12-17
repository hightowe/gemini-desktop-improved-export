/**
 * About section component for the Options window.
 * 
 * Displays legal disclaimers, version information, and links to relevant
 * documentation and Google's Terms of Service.
 * 
 * @module AboutSection
 */

import { memo } from 'react';
import './about-section.css';

/**
 * Application version - pulled from package.json at build time.
 */
const APP_VERSION = '0.1.0';

/**
 * AboutSection component displays legal attribution and version information.
 * 
 * Features:
 * - Version number display
 * - Legal disclaimer (unofficial project notice)
 * - Trademark acknowledgements
 * - Links to LICENSE and Google's ToS
 */
export const AboutSection = memo(function AboutSection() {
    return (
        <div className="about-section" data-testid="about-section">
            {/* App Title and Version */}
            <div className="about-header">
                <h1 className="about-title">Gemini Desktop</h1>
                <span className="about-version" data-testid="about-version">
                    Version {APP_VERSION}
                </span>
            </div>

            {/* Legal Disclaimer */}
            <div className="about-disclaimer" data-testid="about-disclaimer">
                <p className="about-disclaimer-text">
                    This application is an <strong>unofficial</strong> open-source project.
                    It is <strong>NOT</strong> affiliated with, endorsed by, maintained by,
                    or associated with Google LLC or the Gemini team in any way.
                </p>
            </div>

            {/* Trademark Notice */}
            <div className="about-trademarks">
                <p className="about-trademark-text">
                    "Gemini" and "Google" are registered trademarks of Google LLC.
                    This software is a third-party client and is not a Google product.
                </p>
            </div>

            {/* Links Section */}
            <div className="about-links">
                <a
                    href="https://github.com/bwendell/gemini-desktop/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-link"
                    data-testid="about-license-link"
                >
                    View License (MIT)
                </a>
                <a
                    href="https://github.com/bwendell/gemini-desktop/blob/main/DISCLAIMER.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-link"
                    data-testid="about-disclaimer-link"
                >
                    View Full Disclaimer
                </a>
                <span className="about-link-separator">|</span>
                <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-link"
                    data-testid="about-google-tos-link"
                >
                    Google Terms of Service
                </a>
                <a
                    href="https://policies.google.com/terms/generative-ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-link"
                    data-testid="about-google-ai-link"
                >
                    AI Usage Policies
                </a>
            </div>

            {/* Copyright */}
            <div className="about-copyright">
                <p>© 2025 Ben Wendell. Released under the MIT License.</p>
            </div>
        </div>
    );
});
