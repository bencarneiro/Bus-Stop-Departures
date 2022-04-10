from django.http import HttpResponse, JsonResponse
from django.views import View

from io import BytesIO, StringIO
from zipfile import ZipFile
from urllib.request import urlopen
import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt
from google.transit import gtfs_realtime_pb2
import urllib
from zipfile import ZipFile
from datetime import datetime, date, timedelta

# read GTFS Data to get linking IDS from capmetro
resp = urlopen("https://data.texas.gov/download/r4v4-vz24/application%2Fzip")
zipfile = ZipFile(BytesIO(resp.read()))

# Initialize trips DF to lookup real time data
with zipfile.open('trips.txt') as myfile:
    trips_csv = myfile.read()
trips_df = pd.read_csv(BytesIO(trips_csv))

# Initialize order of Northbound and Southbound Stops for ATX route #7
with zipfile.open('stop_times.txt') as myfile:
    stop_times = myfile.read()
stop_times = pd.read_csv(BytesIO(stop_times))
# sb_stops = stop_times[stop_times['trip_id']=='2630858_MRG_3'][['stop_sequence', 'stop_id', 'shape_dist_traveled']].reset_index()
# nb_stops = stop_times[stop_times['trip_id']=='2630928_MRG_6'][['stop_sequence', 'stop_id', 'shape_dist_traveled']].reset_index()
bens_stop_nb_seven = 1260
bens_stop_sb_seven = 4152

def GetScheduledArrivalTime(direction, trip_id):
    if direction == "NB":
        bens_stop = stop_times[(stop_times['trip_id']==trip_id) & (stop_times['stop_id'] == bens_stop_nb_seven)].reset_index()
        return bens_stop['departure_time'][0]
    if direction == "SB":
        bens_stop = stop_times[(stop_times['trip_id']==trip_id) & (stop_times['stop_id'] == bens_stop_sb_seven)].reset_index()
        return bens_stop['departure_time'][0]
    
def MilesToBen(direction, route_distance):
    if direction == "NB":
        return 19.838 - route_distance
    elif direction == "SB":
        return 6.175 - route_distance

def MinutesToArrival(direction, stop_sequence, scheduled_stop_arrival, seconds_late):
    # Catch passed buses
    if (direction == "NB" and stop_sequence > 50) or (direction == "SB" and stop_sequence > 13):
        return "PAST STOP"
    # Catch arriving buses
    elif (direction == "NB" and stop_sequence == 50) or (direction == "SB" and stop_sequence == 13):
        return "NOW"
    else:
        today = date.today()
        today_str = today.strftime("%Y-%m-%d")
        scheduled_time_str = today_str + " " + scheduled_stop_arrival
        scheduled_time = datetime.strptime(scheduled_time_str, '%Y-%m-%d %H:%M:%S')
        eta = scheduled_time + timedelta(seconds=seconds_late)
        seconds_away = abs(eta - datetime.now()).seconds
        minutes_away = round(seconds_away/60)
        return f"{minutes_away}"

class BusDeparturesView(View):
    # bus.com/departures

    def get(self, request, *args, **kwargs):

        # Pull Most Recent Data and format it into a geodataframe

        feed = gtfs_realtime_pb2.FeedMessage()
        response = urllib.request.urlopen('https://data.texas.gov/download/eiei-9rpf/application%2Foctet-stream')
        feed.ParseFromString(response.read()) 
        columns = [
            'vehicle_id', 
            'route_id', 
            'trip_id', 
            'timestamp', 
            'current_stop_sequence', 
            'status', 
            'stop_id', 
            'latitude', 
            'longitude',
            'bearing',
            'speed',
            'direction',
            'route_distance',
            'seconds_late'
        ]
        bus_df = pd.DataFrame(columns=columns,data=[])
        for vehicle in feed.entity:
            data_list = [vehicle.id]
            if vehicle.vehicle.trip.route_id == "7":
                # Route ID
                if vehicle.vehicle.trip.route_id:
                    data_list += [vehicle.vehicle.trip.route_id]
                else:
                    data_list += [None]
                # Trip ID
                if vehicle.vehicle.trip.trip_id:
                    data_list += [vehicle.vehicle.trip.trip_id]
                else:
                    data_list += [None]
                # Timestamp
                if vehicle.vehicle.timestamp:
                    data_list += [vehicle.vehicle.timestamp]
                else:
                    data_list += [None]
                # Current Stop Sequence
                if vehicle.vehicle.current_stop_sequence:
                    data_list += [vehicle.vehicle.current_stop_sequence]
                else:
                    data_list += [None]
                # Current Vehicle Status
                if vehicle.vehicle.current_status:
                    data_list += [vehicle.vehicle.current_status]
                else:
                    data_list += [None]
                # Stop ID
                if vehicle.vehicle.stop_id:
                    data_list += [vehicle.vehicle.stop_id]
                else:
                    data_list += [None]
                # Latitude
                if vehicle.vehicle.position.latitude:
                    data_list += [vehicle.vehicle.position.latitude]
                else: 
                    data_list += [None]
                # Longitude
                if vehicle.vehicle.position.longitude:
                    data_list += [vehicle.vehicle.position.longitude]
                else: 
                    data_list += [None]
                # Bearing
                if vehicle.vehicle.position.bearing:
                    data_list += [vehicle.vehicle.position.bearing]
                else: 
                    data_list += [None]
                # Speed
                if vehicle.vehicle.position.speed:
                    data_list += [vehicle.vehicle.position.speed]
                else: 
                    data_list += [None]
                
                # Direction Identification
                if vehicle.vehicle.trip.trip_id:
                    trip_df = trips_df[trips_df['trip_id']==vehicle.vehicle.trip.trip_id].reset_index()
                    if "NB" in trip_df['trip_headsign'][0]:
                        data_list += ["NB"]
                    elif "SB" in trip_df['trip_headsign'][0]:
                        data_list += ["SB"]
                    else:
                        data_list += [None]
                
                # Early / Late calculation & route-distance 
                if vehicle.vehicle.stop_id and vehicle.vehicle.trip.trip_id:
                    # filter stops schedule down to this exact trip
                    schedule = stop_times[stop_times['trip_id']==vehicle.vehicle.trip.trip_id].reset_index()
                    stop_schedule = schedule[schedule['stop_id']==int(vehicle.vehicle.stop_id)].reset_index()
                    # write distance
                    data_list += [stop_schedule['shape_dist_traveled'][0]]
                    # snag real and scheduled times
                    real_time = datetime.fromtimestamp(vehicle.vehicle.timestamp)
                    scheduled_time_str = stop_schedule['departure_time'][0]
                    today = date.today()
                    today_str = today.strftime("%Y-%m-%d")
                    scheduled_time_str = today_str + " " + scheduled_time_str
                    scheduled_time = datetime.strptime(scheduled_time_str, '%Y-%m-%d %H:%M:%S')
                    # Calculate early / Late
                    time_diff = abs(real_time - scheduled_time).seconds
                    data_list += [time_diff]
                else:
                    data_list += [None, None]
                    
                    
                # Add Row to DataFrame   
                temp_df = pd.DataFrame(columns=columns,data=[data_list])
                bus_df = pd.concat([bus_df,temp_df], ignore_index=True)

        # Convert lat/lon to GeoDataFrame
        bus_gdf = gpd.GeoDataFrame(bus_df, geometry=gpd.points_from_xy(bus_df.longitude, bus_df.latitude))
        bus_gdf['scheduled_stop_arrival'] = bus_gdf.apply(lambda row: GetScheduledArrivalTime(row['direction'], row['trip_id']), axis=1)
        bus_gdf['miles_to_stop']          = bus_gdf.apply(lambda row: MilesToBen(row['direction'], row['route_distance']), axis=1)
        bus_gdf['minutes_away']           = bus_gdf.apply(lambda row: MinutesToArrival(row['direction'], row['current_stop_sequence'], row['scheduled_stop_arrival'], row['seconds_late']), axis=1)


        display_info = bus_gdf[bus_gdf['minutes_away'] != 'PAST STOP'][['minutes_away', 'direction', 'miles_to_stop', 'scheduled_stop_arrival', 'seconds_late' ]].sort_values(by=['direction', 'minutes_away']).reset_index()
        resp_arr = []
        for index, row in display_info.iterrows():
            bus_obj = {
                'direction': row['direction'],
                'minutes_away': row['minutes_away'],
                'miles_to_stop': row['miles_to_stop'],
                'scheduled_stop_arrival': row['scheduled_stop_arrival'],
                'seconds_late': row['seconds_late']
            }
            resp_arr += [bus_obj]
        resp_obj = {
            'buses': resp_arr
        }
        return JsonResponse(data=resp_obj)