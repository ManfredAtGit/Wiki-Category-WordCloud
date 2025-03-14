/**
 * Visualization functionality using D3.js
 */
import * as d3 from 'd3';
import cloud from 'd3-cloud';

/**
 * Creates a word cloud visualization
 * @param {Map<string, number>} frequencies - Map of words to their frequencies
 * @param {string} selector - CSS selector for the container element
 */
export function createWordCloud(frequencies, selector) {
    // Clear previous visualization
    d3.select(selector).selectAll('*').remove();

    // Convert frequencies to array and sort by count
    const words = Array.from(frequencies.entries())
        .map(([text, size]) => ({ text, size }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 100); // Limit to top 100 words

    if (words.length === 0) {
        console.warn('No words to display in word cloud');
        return;
    }

    // Set up dimensions
    const width = document.querySelector(selector).offsetWidth;
    const height = 500;
    const padding = 2;

    // Create size scale
    const fontSize = d3.scaleLinear()
        .domain([
            d3.min(words, d => d.size) || 1,
            d3.max(words, d => d.size) || 1
        ])
        .range([14, 80]);

    // Create color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create SVG container first
    const svg = d3.select(selector)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Add a group element for the word cloud
    const g = svg.append('g')
        .attr('transform', `translate(${width/2},${height/2})`);

    // Create the layout
    const layout = cloud()
        .size([width, height])
        .words(words)
        .padding(padding)
        .rotate(() => 0) // No rotation for better readability
        .fontSize(d => fontSize(d.size))
        .on('end', draw);

    // Draw function
    function draw(words) {
        // Create word elements
        const text = g.selectAll('text')
            .data(words)
            .enter()
            .append('text')
            .style('font-size', d => `${d.size}px`)
            .style('fill', (d, i) => color(i))
            .attr('text-anchor', 'middle')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .text(d => d.text);

        // Add tooltips
        text.append('title')
            .text(d => `${d.text}: ${d.size}`);

        // Add click handler
        text.style('cursor', 'pointer')
            .on('click', (event, d) => {
                console.log(`Selected word: ${d.text} (frequency: ${d.size})`);
            });
    }

    // Start the layout
    try {
        layout.start();
    } catch (error) {
        console.error('Error generating word cloud:', error);
    }
}
