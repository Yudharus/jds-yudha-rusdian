import { Component, Inject, Injectable } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as d3 from 'd3';
import { ChartDataService } from './chart-data.service';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(@Inject(ChartDataService) chartDataService) {
    this.chartDataService = chartDataService;
    this.name = "yudha"
  }


  ngOnInit() {
    this.chartDataService.getChartBarData().subscribe(response => {
      const data = response.data.map(item => ({
        name: item.nama_kabupaten_kota,
        value: item.jumlah_ruang_kelas
      }));

      this.createBarChart(data);
    });

    this.chartDataService.getChartPieData().subscribe(pieResponse => {
      const pieChartData = pieResponse.data.map(item => item.jumlah_kesenian);
      const dataKabupatenKota = pieResponse.data.map(item => item.nama_kabupaten_kota);

      this.createPieChart("#pie-chart1", pieChartData, dataKabupatenKota);
    });

    this.chartDataService.getChartLineData().subscribe((response) => {
      const data = response.data;
      this.createLineChart(data);
    });
    this.initMap()
  }

  createBarChart(data) {
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const svgWidth = 800;
    const svgHeight = 500;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart").append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Skala untuk sumbu x
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.name))
      .padding(0.2);

    // Skala untuk sumbu y
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([height, 0]);

    // Skala warna
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(d3.schemeSet2);

    // Menambahkan sumbu x
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Menambahkan sumbu y
    svg.append("g")
      .call(d3.axisLeft(y));

    // Menambahkan batang-batang grafik
    svg.selectAll("rect")
      .data(data)
      .enter().append("rect")
      .attr("x", d => x(d.name))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.name))
      .append("title")
      .text(d => `${d.name}: ${d.value}`); // Menambahkan tooltip


    // Menambahkan label di atas batang
    svg.selectAll(".text")
      .data(data)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", d => x(d.name) + x.bandwidth() / 2)
      .attr("y", d => y(d.value) - 10)
      .attr("text-anchor", "middle")
      // .text(d => d.value)
      .style("fill", "black")
      .style("font-size", "12px");
  }


  createPieChart(selector, data, dataKabupatenKota) {
    const svgWidth = document.querySelector(selector).offsetWidth;
    const svgHeight = window.innerHeight / 2.2 - 20; // Tinggi disesuaikan agar cocok dengan layar
    const radius = Math.min(svgWidth, svgHeight) / 2;

    const svg = d3.select(selector).append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")");

    // Membuat skala warna ordinal
    const color = d3.scaleOrdinal(d3.schemePaired);

    // Mengatur domain skala warna berdasarkan nama_kabupaten_kota
    color.domain(dataKabupatenKota);

    const pie = d3.pie()
      .sort(null)
      .value(d => d);

    const arc = d3.arc()
      .innerRadius(radius * 0.6) // Menentukan inner radius untuk membuat efek donut
      .outerRadius(radius - 10);

    const arcs = svg.selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(dataKabupatenKota[i])) // Menggunakan color dengan index i
      .transition()
      .duration(800)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t));
        };
      });

    // Menambahkan label di tengah donut
    arcs.append("text")
      .attr("transform", function (d) {
        const pos = arc.centroid(d);
        return `translate(${pos[0]}, ${pos[1]})`;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-size", "4px") // Ukuran teks diatur di sini
      .text(function (d, i) {
        return `${dataKabupatenKota[i]} ${d.data}%`; // Menggunakan dataKabupatenKota sesuai dengan index
      });
  }

  createLineChart(data) {

    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const svgWidth = 600;
    const svgHeight = 400;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#line-chart").append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.diklat_perurusan))
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.jumlah_lulusan)])
      .nice()
      .range([height, 0]);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", ".5em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-5)");


    svg.append("g")
      .call(d3.axisLeft(y));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(d => x(d.diklat_perurusan) + x.bandwidth() / 2)
        .y(d => y(d.jumlah_lulusan))
      )
      .style("font-size", "4px"); // Ukuran teks diatur di sini

    svg.selectAll(".label")
      .data(data)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", d => x(d.diklat_perurusan) + x.bandwidth() / 2)
      .attr("y", d => y(d.jumlah_lulusan) - 10)
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .style("font-size", "12px") // Ukuran teks diatur di sini
      .text(d => d.jumlah_lulusan);


  }

  initMap() {
    this.map = L.map('map', {
      center: [-0.7893, 113.9213], // Koordinat awal untuk pusat peta
      zoom: 6, // Level zoom awal
      zoomControl: true, // Menampilkan kontrol zoom
    });

    // Tambahkan tile layer dari OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }
}
