<template>
  <div class="map-container">
    <div id="container" ref="mapDiv"></div>
    <div class="controls">
      <h3>Search Place</h3>
      <input type="text" v-model="searchQuery" @input="debouncedPoiSearch" placeholder="Search Place..." />
      <ul v-if="searchResults.length">
        <li v-for="result in searchResults" :key="result.id" @click="selectPlace(result)">
          {{ result.name }} ({{ result.address }})
        </li>
      </ul>
      <h3>Route Planning</h3>
      <input type="text" v-model="originQuery" @input="debouncedOriginSearch" placeholder="Origin..." />
      <ul v-if="originResults.length">
        <li v-for="result in originResults" :key="result.id" @click="selectOrigin(result)">
          {{ result.name }} ({{ result.address }})
        </li>
      </ul>
      <input type="text" v-model="destinationQuery" @input="debouncedDestinationSearch" placeholder="Destination..." />
      <ul v-if="destinationResults.length">
        <li v-for="result in destinationResults" :key="result.id" @click="selectDestination(result)">
          {{ result.name }} ({{ result.address }})
        </li>
      </ul>
      <button @click="getDirections" :disabled="!selectedOrigin || !selectedDestination">Get Route</button>
      <button v-if="driving" @click="clearDirections">Clear Route</button>
    </div>
  </div>
</template>
<script>
import AMapLoader from '@amap/amap-jsapi-loader';
import { debounce } from 'lodash'; // 需要安装 lodash：npm install lodash
export default {
  name: 'MapComponent',
  data() {
    return {
      map: null,
      AMap: null, // Stores the AMap object
      markers: [], // To store place markers
      infoWindow: null, // For showing place details
      // Search Places (POI Search)
      searchQuery: '',
      searchResults: [],
      placeSearch: null, // AMap.PlaceSearch instance
      // Directions
      originQuery: '',
      originResults: [],
      selectedOrigin: null, // Selected origin POI
      destinationQuery: '',
      destinationResults: [],
      selectedDestination: null, // Selected destination POI
      driving: null, // AMap.Driving instance for route rendering
    };
  },
  async mounted() {
    await this.loadAmap();
    this.initMap();
    this.initServices();
  },
  methods: {
    async loadAmap() {
      const AMAP_KEY = "a838deadf73eccc56451e117db6e0cf0"; // For Vite
      // const AMAP_KEY = process.env.VUE_APP_AMAP_KEY; // For Vue CLI
      if (!AMAP_KEY) {
        console.error("Amap API Key is not set. Please add VITE_AMAP_KEY to your .env file.");
        return;
      }
      try {
        this.AMap = await AMapLoader.load({
          key: "a838deadf73eccc56451e117db6e0cf0",         // 申请好的Web端开发者Key
          version: '2.0',        // 指定JSAPI版本
          plugins: ['AMap.PlaceSearch', 'AMap.AutoComplete', 'AMap.Driving', 'AMap.InfoWindow'], // 需要使用的插件列表
        });
      } catch (error) {
        console.error('Error loading Amap API:', error);
      }
    },
    initMap() {
      if (!this.AMap) return;
      this.map = new this.AMap.Map(this.$refs.mapDiv, {
        zoom: 12,
        center: [116.397428, 39.90923], // 默认北京中心点
        viewMode: '3D', // 设置地图模式为3D
      });
      // AMap.InfoWindow 可以在之后按需创建，或全局创建
    },
    initServices() {
      if (!this.AMap) return;
      this.infoWindow = new this.AMap.InfoWindow({
        offset: new this.AMap.Pixel(0, -30) // 窗体相对于Marker的偏移量
      });
      // POI搜索服务
      this.placeSearch = new this.AMap.PlaceSearch({
        pageSize: 5,        // 单页显示结果条数
        pageIndex: 1,       // 页码
        city: '全国',       // 兴趣点城市
        map: this.map,      // 展现结果的地图实例
        panel: '',          // 结果列表将在此容器中进行展示，留空则不显示列表
        autoFitView: true   // 是否自动调整地图视野
      });
      // 路线规划服务
      this.driving = new this.AMap.Driving({
        map: this.map,
        panel: null, // 不展示驾车结果面板，结果会在地图上绘制
        policy: this.AMap.DrivingPolicy.LEAST_TIME // 驾车策略：最少时间
      });
    },
    // --- Feature 1: Search Places of Interest (POI Search) ---
    async poiSearch() {
      if (!this.searchQuery) {
        this.searchResults = [];
        return;
      }
      // 使用高德AutoComplete服务进行地点预测
      const autocomplete = new this.AMap.AutoComplete({
        city: '全国' // 可根据需求限制城市
      });
      autocomplete.search(this.searchQuery, (status, result) => {
        if (status === 'complete' && result.tips) {
          this.searchResults = result.tips.filter(tip => tip.location); // 过滤掉没有地理位置信息的建议
        } else {
          this.searchResults = [];
        }
      });
    },
    debouncedPoiSearch: debounce(function() {
      this.poiSearch();
    }, 500),
    selectPlace(placeResult) {
      this.searchQuery = placeResult.name;
      this.searchResults = [];
      this.clearMarkers(); // 清除现有标记
      // 放置标记并显示信息窗体
      if (placeResult.location) {
        const marker = new this.AMap.Marker({
          position: [placeResult.location.lng, placeResult.location.lat],
          map: this.map,
          title: placeResult.name,
        });
        this.markers.push(marker);
        this.map.setCenter([placeResult.location.lng, placeResult.location.lat]);
        this.map.setZoom(15);
        this.infoWindow.setContent(`
          <strong>${placeResult.name}</strong><br>
          ${placeResult.address}
        `);
        this.infoWindow.open(this.map, marker.getPosition()); // 在标记位置打开信息窗体
      } else {
          console.warn('Selected place has no location:', placeResult);
      }
    },
    clearMarkers() {
      if (this.markers.length > 0) {
        this.map.remove(this.markers); // 移除地图上的所有标记
        this.markers = [];
        this.infoWindow.close(); // 关闭信息窗体
      }
    },
    // --- Feature 2: Directions / Route Planning ---
    async searchOrigin() {
      if (!this.originQuery) {
        this.originResults = [];
        return;
      }
      const autocomplete = new this.AMap.AutoComplete({ city: '全国' });
      autocomplete.search(this.originQuery, (status, result) => {
        this.originResults = (status === 'complete' && result.tips) ? result.tips.filter(tip => tip.location) : [];
      });
    },
    debouncedOriginSearch: debounce(function() {
      this.searchOrigin();
    }, 500),
    selectOrigin(placeResult) {
      this.originQuery = placeResult.name;
      this.originResults = [];
      this.selectedOrigin = [placeResult.location.lng, placeResult.location.lat]; // 存储经纬度作为起点
      console.log('Origin selected:', this.selectedOrigin);
    },
    async searchDestination() {
      if (!this.destinationQuery) {
        this.destinationResults = [];
        return;
      }
      const autocomplete = new this.AMap.AutoComplete({ city: '全国' });
      autocomplete.search(this.destinationQuery, (status, result) => {
        this.destinationResults = (status === 'complete' && result.tips) ? result.tips.filter(tip => tip.location) : [];
      });
    },
    debouncedDestinationSearch: debounce(function() {
      this.searchDestination();
    }, 500),
    selectDestination(placeResult) {
      this.destinationQuery = placeResult.name;
      this.destinationResults = [];
      this.selectedDestination = [placeResult.location.lng, placeResult.location.lat]; // 存储经纬度作为终点
      console.log('Destination selected:', this.selectedDestination);
    },
    getDirections() {
        if (!this.selectedOrigin || !this.selectedDestination) {
            alert('请选择起点和终点！');
            return;
        }
        // 清除上一次的路线
        this.driving.clear();
        this.clearMarkers(); // 清除可能存在的搜索标记
        // 经纬度格式为 [lng, lat]
        this.driving.search(this.selectedOrigin, this.selectedDestination, (status, result) => {
            if (status === 'complete' && result.routes && result.routes.length) {
                // 路线已在地图上绘制，可以获取并显示相关信息
                const route = result.routes[0].legs[0];
                const distance = (route.distance / 1000).toFixed(1); // 米转公里
                const durationMinutes = Math.floor(route.duration / 60); // 秒转分钟
                this.infoWindow.setContent(`
                  <strong>距离:</strong> ${distance} 公里<br>
                  <strong>预计时间:</strong> ${durationMinutes} 分钟
                `);
                this.infoWindow.open(this.map, result.routes[0].steps[0].start_location); // 在路线起点附近显示信息
                this.map.setFitView(); // 自动调整地图视野以显示完整路线
            } else {
                window.alert('路线规划失败: ' + status + (result || '').toString());
                this.driving.clear(); // 确保清除
            }
        });
    },
    clearDirections() {
        if (this.driving) {
            this.driving.clear();
            this.infoWindow.close();
            this.clearMarkers(); // 清除可能存在的搜索标记
            this.originQuery = '';
            this.destinationQuery = '';
            this.selectedOrigin = null;
            this.selectedDestination = null;
        }
    }
  },
  beforeUnmount() {
    if (this.map) {
      this.map.destroy(); // 组件销毁时销毁地图实例，释放资源
    }
  }
};
</script>
<style scoped>
/* 样式与 Google Maps 版本保持一致，这里不再重复展示 */
.map-container {
  display: flex;
  height: 80vh; /* 地图容器高度 */
  width: 100%;
  border: 1px solid #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
#container { /* 高德地图默认使用 #container id */
  flex-grow: 1; /* 地图占据大部分宽度 */
  min-width: 60%; /* 最小宽度，防止控件过长挤压地图 */
}
.controls {
  width: 300px; /* 控制面板宽度 */
  padding: 20px;
  background-color: #f9f9f9;
  border-left: 1px solid #eee;
  overflow-y: auto; /* 控制面板内容多时可滚动 */
}
.controls h3 {
  margin-top: 0;
  color: #333;
  margin-bottom: 15px;
}
.controls input[type="text"] {
  width: calc(100% - 22px); /* 减去padding */
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.controls button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}
.controls button:hover:not(:disabled) {
  background-color: #0056b3;
}
.controls button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.controls ul {
  list-style-type: none;
  padding: 0;
  margin: 0 0 15px 0;
  border: 1px solid #eee;
  border-radius: 4px;
  max-height: 150px;
  overflow-y: auto;
}
.controls ul li {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.controls ul li:last-child {
  border-bottom: none;
}
.controls ul li:hover {
  background-color: #e9e9e9;
}
</style>