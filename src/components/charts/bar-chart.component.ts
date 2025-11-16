import { Component, ChangeDetectionStrategy, input, ElementRef, OnChanges, SimpleChanges, viewChild, afterNextRender } from '@angular/core';
import * as d3 from 'd3';

interface ChartData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent implements OnChanges {
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
      .padding(0.4);

    const y = d3Instance.scaleLinear()
      .domain([0, d3Instance.max(data, d => d.value) as number])
      .nice()
      .range([height, 0]);

    // Axes
    svg.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3Instance.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-40)');

    svg.append('g')
      .attr('class', 'axis y-axis')
      .call(d3Instance.axisLeft(y));

    // Bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label) as number)
      .attr('y', height) // Start from bottom for animation
      .attr('width', x.bandwidth())
      .attr('height', 0) // Start with 0 height for animation
      .attr('rx', 4)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value));

    // Tooltip
    const tooltip = d3Instance.select(element)
      .append('div')
      .attr('class', 'tooltip');
      
    svg.selectAll('.bar')
      // FIX: The datum 'd' is inferred as 'unknown', so we explicitly type it as ChartData.
      .on('mouseover', function(event, d: ChartData) {
        d3Instance.select(this).classed('bar-hover', true);
        tooltip.style('visibility', 'visible')
               .html(`<strong>${d.label}</strong><br>${d.value} notes`);
      })
      .on('mousemove', function(event) {
        tooltip.style('top', (event.pageY - 10) + 'px')
               .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3Instance.select(this).classed('bar-hover', false);
        tooltip.style('visibility', 'hidden');
      });
  }
}