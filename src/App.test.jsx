import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
    it('renders the main application title', () => {
        render(<App />);

        const titleElement = screen.getByText(/Actors Confluence/i);
        expect(titleElement).toBeInTheDocument();
    });

    it('renders the search input', () => {
        render(<App />);

        const inputElement = screen.getByPlaceholderText(/Ex: Brad Pitt.../i);
        expect(inputElement).toBeInTheDocument();
    });
});
