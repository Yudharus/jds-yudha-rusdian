import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ChartDataService {
    constructor(@Inject(HttpClient) http) {
        this.http = http;
        this.apiUrl = 'https://data.jabarprov.go.id/api-backend/bigdata/disdik/od_17915_jml_ruang_kelas_sekolah_dasar_sd__kondisi_ruangan'
        this.apiUrl2 = 'https://data.jabarprov.go.id/api-backend/bigdata/disparbud/od_17938_jml_kesenian__status_kesenian_kabupatenkota_v1?limit=20'
        this.apiUrl3 = 'https://data.jabarprov.go.id/api-backend/bigdata/bpsdm/od_16345_jml_lulusan_pengembangan_kompetensi__diklat_peruru_v3?limit=5'
    }

    getChartBarData() {
        return this.http.get(this.apiUrl);
    }

    getChartPieData() {
        return this.http.get(this.apiUrl2);
    }

    getChartLineData() {
        return this.http.get(this.apiUrl3);
    }
}
