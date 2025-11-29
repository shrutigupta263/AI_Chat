export interface LocationData {
  [country: string]: {
    [state: string]: string[];
  };
}

export const LOCATION_DATA: LocationData = {
  'United States': {
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose', 'Any'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse', 'Any'],
    'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'Any'],
    'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'Any'],
    'Illinois': ['Chicago', 'Springfield', 'Naperville', 'Aurora', 'Rockford', 'Any'],
    'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Any'],
    'Any': ['Any'],
  },
  'Canada': {
    'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London', 'Any'],
    'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Any'],
    'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 'Any'],
    'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Fort McMurray', 'Any'],
    'Manitoba': ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie', 'Any'],
    'Any': ['Any'],
  },
  'United Kingdom': {
    'England': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Any'],
    'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness', 'Any'],
    'Wales': ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry', 'Any'],
    'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Newry', 'Armagh', 'Any'],
    'Any': ['Any'],
  },
  'Australia': {
    'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Maitland', 'Any'],
    'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton', 'Any'],
    'Queensland': ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns', 'Any'],
    'Western Australia': ['Perth', 'Mandurah', 'Bunbury', 'Kalgoorlie', 'Geraldton', 'Any'],
    'South Australia': ['Adelaide', 'Mount Gambier', 'Whyalla', 'Murray Bridge', 'Port Augusta', 'Any'],
    'Any': ['Any'],
  },
  'India': {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Any'],
    'Delhi': ['New Delhi', 'Delhi', 'Any'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Any'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Any'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Any'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Any'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Any'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Any'],
    'Any': ['Any'],
  },
  'Any': {
    'Any': ['Any'],
  },
};

// Get states for a given country
export function getStatesForCountry(country: string): string[] {
  if (!country || !LOCATION_DATA[country]) {
    return ['Any'];
  }
  return Object.keys(LOCATION_DATA[country]);
}

// Get cities for a given country and state
export function getCitiesForState(country: string, state: string): string[] {
  if (!country || !state || !LOCATION_DATA[country] || !LOCATION_DATA[country][state]) {
    return ['Any'];
  }
  return LOCATION_DATA[country][state];
}

