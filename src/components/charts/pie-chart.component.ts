import { Component, ChangeDetectionStrategy, input, ElementRef, OnChanges, SimpleChanges, viewChild, afterNextRender } from '@angular/core';
import * as d3 from 'd3';

interface ChartData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChartComponent implements OnChanges {
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

    const width = element.clientWidth;
    const height = element.clientHeight;
    const radius = Math.min(width, height) / 2.5;

    const svg = d3Instance.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3Instance.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(["#ee6983", "#ffc4c4", "#850e35", "#cc8db3", "#f6a5c0"]);

    const pie = d3Instance.pie<ChartData>()
      .value(d => d.value)
      .sort(null);

    // FIX: The arc generator should be typed to expect a PieArcDatum object.
    const arc = d3Instance.arc<any, d3.PieArcDatum<ChartData>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);

    const path = svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('class', 'pie-slice')
      .attr('fill', d => color(d.data.label) as string)
      .attr('d', arc)
      .each(function(d) { (this as any)._current = d; }); // store the initial angles

    path.transition().duration(1000).attrTween('d', function(d) {
        const i = d3Instance.interpolate((this as any)._current, d);
        (this as any)._current = i(0);
        return function(t) {
            return arc(i(t));
        };
    });
    
    // Add labels
    // FIX: The arc generator for labels should be typed to expect a PieArcDatum object.
    const labelArc = d3Instance.arc<any, d3.PieArcDatum<ChartData>>()
      .outerRadius(radius * 0.9)
      .innerRadius(radius * 0.9);

    svg.selectAll('text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '0.35em')
      .attr('class', 'pie-label')
      .text(d => `${d.data.label} (${d.data.value}%)`)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay(500)
      .style('opacity', 1);
  }
}