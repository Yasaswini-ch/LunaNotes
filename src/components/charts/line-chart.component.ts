import { Component, ChangeDetectionStrategy, input, ElementRef, OnChanges, SimpleChanges, viewChild, afterNextRender } from '@angular/core';
import * as d3 from 'd3';

interface ChartData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent implements OnChanges {
  data = input.required<ChartData[]>();
  
  private chartContainer = viewChild<ElementRef>('chartContainer');
  private d3: typeof d3;

  constructor() {
    this.d3 = (d3 as any).default || d3;
    afterNextRender(() => {
      this.createChart();
    });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.chartContainer()) {
       this.createChart();
    }
  }

  private createChart(): void {
    const data = this.data();
    const element = this.chartContainer()?.nativeElement;
    if (!data || !element || data.length === 0) return;

    const d3Instance = this.d3;
    d3Instance.select(element).select('svg').remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom;

    const svg = d3Instance.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3Instance.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.5);

    const y = d3Instance.scaleLinear()
      .domain([0, d3Instance.max(data, d => d.value) as number])
      .range([height, 0]);

    // Axes
    svg.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3Instance.axisBottom(x));

    svg.append('g')
      .attr('class', 'axis y-axis')
      .call(d3Instance.axisLeft(y));

    // Line generator
    const line = d3Instance.line<ChartData>()
      .x(d => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .y(d => y(d.value))
      .curve(d3Instance.curveMonotoneX);

    // Draw the line path
    svg.append('path')
      .datum(data)
      .attr('class', 'line-path')
      .attr('d', line)
      .attr('stroke-dasharray', function() { return (this as SVGPathElement).getTotalLength() + " " + (this as SVGPathElement).getTotalLength(); })
      .attr('stroke-dashoffset', function() { return (this as SVGPathElement).getTotalLength(); })
      .transition()
      .duration(1500)
      .ease(d3Instance.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Add points
    svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .attr('cy', d => y(d.value))
      .attr('r', 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 100 + 500)
      .attr('r', 5);
      
     // Tooltip
    const tooltip = d3Instance.select(element)
      .append('div')
      .attr('class', 'tooltip');
      
    svg.selectAll('.dot')
      // FIX: The datum 'd' is inferred as 'unknown', so we explicitly type it as ChartData.
      .on('mouseover', function(event, d: ChartData) {
        tooltip.style('visibility', 'visible')
               .text(`${d.label}: ${d.value}`);
      })
      .on('mousemove', function(event) {
        tooltip.style('top', (event.pageY - 10) + 'px')
               .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('visibility', 'hidden');
      });
  }
}