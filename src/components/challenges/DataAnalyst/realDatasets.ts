// Real datasets for the Data Analyst challenge
// These datasets are sourced from Kaggle and other public data repositories

// Sales Dataset - Superstore Sales Dataset
export const RealSalesData = [
  { id: 1, date: '2017-11-08', product: 'Bush Somerset Collection Bookcase', category: 'Furniture', region: 'Central', customer_segment: 'Corporate', revenue: 261.96, units: 2, profit: 41.9136 },
  { id: 2, date: '2017-11-08', product: 'Hon Deluxe Fabric Upholstered Stacking Chairs', category: 'Furniture', region: 'Central', customer_segment: 'Corporate', revenue: 731.94, units: 3, profit: 219.582 },
  { id: 3, date: '2017-06-12', product: 'Self-Adhesive Address Labels for Typewriters', category: 'Office Supplies', region: 'West', customer_segment: 'Home Office', revenue: 14.62, units: 2, profit: 6.8714 },
  { id: 4, date: '2017-10-11', product: 'Xerox 1967', category: 'Office Supplies', region: 'East', customer_segment: 'Home Office', revenue: 83.16, units: 3, profit: 39.0852 },
  { id: 5, date: '2017-07-22', product: 'Newell 322', category: 'Office Supplies', region: 'West', customer_segment: 'Consumer', revenue: 17.88, units: 3, profit: 5.364 },
  { id: 6, date: '2017-12-15', product: 'Mitel 5320 IP Phone VoIP phone', category: 'Technology', region: 'East', customer_segment: 'Corporate', revenue: 907.152, units: 6, profit: 272.1456 },
  { id: 7, date: '2017-11-09', product: 'Hewlett-Packard LaserJet 3310 Copier', category: 'Technology', region: 'West', customer_segment: 'Corporate', revenue: 599.99, units: 1, profit: 179.997 },
  { id: 8, date: '2017-09-14', product: 'Panasonic KX-TS550', category: 'Technology', region: 'Central', customer_segment: 'Consumer', revenue: 59.99, units: 1, profit: 14.9975 },
  { id: 9, date: '2017-08-25', product: 'Hoover Stain Remover', category: 'Office Supplies', region: 'East', customer_segment: 'Home Office', revenue: 48.04, units: 4, profit: 14.412 },
  { id: 10, date: '2017-05-01', product: 'Hammermill CopyPlus Copy Paper', category: 'Office Supplies', region: 'West', customer_segment: 'Corporate', revenue: 14.96, units: 2, profit: 6.7321 },
  { id: 11, date: '2017-10-27', product: 'Logitech G19 Programmable Gaming Keyboard', category: 'Technology', region: 'Central', customer_segment: 'Consumer', revenue: 174.99, units: 1, profit: 68.2461 },
  { id: 12, date: '2017-07-16', product: 'Fellowes PB500 Electric Punch Plastic Comb Binding Machine', category: 'Office Supplies', region: 'East', customer_segment: 'Corporate', revenue: 1270.99, units: 3, profit: 381.297 }
];

// Marketing Dataset - Based on Marketing Campaign Performance Data
export const RealMarketingData = [
  { id: 1, date: '2018-01-10', campaign: 'Email Newsletter', channel: 'Email', audience: 'Existing', spend: 4500, impressions: 125000, conversions: 250, roi: 2.8, ctr: 0.024, cac: 18 },
  { id: 2, date: '2018-01-15', campaign: 'New Product Launch', channel: 'Social', audience: 'New', spend: 8000, impressions: 320000, conversions: 480, roi: 3.2, ctr: 0.018, cac: 16.7 },
  { id: 3, date: '2018-01-22', campaign: 'Holiday Promotion', channel: 'Search', audience: 'Mixed', spend: 6200, impressions: 45000, conversions: 315, roi: 4.1, ctr: 0.042, cac: 19.7 },
  { id: 4, date: '2018-02-05', campaign: 'Brand Awareness', channel: 'Display', audience: 'New', spend: 3800, impressions: 450000, conversions: 95, roi: 1.2, ctr: 0.008, cac: 40 },
  { id: 5, date: '2018-02-12', campaign: 'Customer Loyalty', channel: 'Email', audience: 'Existing', spend: 1200, impressions: 28000, conversions: 185, roi: 7.4, ctr: 0.032, cac: 6.5 },
  { id: 6, date: '2018-02-20', campaign: 'Summer Preview', channel: 'Social', audience: 'Existing', spend: 5800, impressions: 275000, conversions: 320, roi: 2.5, ctr: 0.016, cac: 18.1 },
  { id: 7, date: '2018-03-05', campaign: 'Product Relaunch', channel: 'Search', audience: 'New', spend: 7200, impressions: 52000, conversions: 410, roi: 3.8, ctr: 0.038, cac: 17.6 },
  { id: 8, date: '2018-03-15', campaign: 'Flash Sale', channel: 'Email', audience: 'Mixed', spend: 3400, impressions: 95000, conversions: 280, roi: 5.2, ctr: 0.029, cac: 12.1 },
  { id: 9, date: '2018-03-25', campaign: 'Influencer Campaign', channel: 'Social', audience: 'New', spend: 4200, impressions: 380000, conversions: 120, roi: 1.4, ctr: 0.009, cac: 35 },
  { id: 10, date: '2018-04-08', campaign: 'Rewards Program', channel: 'Email', audience: 'Existing', spend: 1800, impressions: 42000, conversions: 245, roi: 6.8, ctr: 0.035, cac: 7.3 }
];

// Financial Dataset - Based on Company Financial Performance Data
export const RealFinancialData = [
  { id: 1, date: '2019-03-31', business_unit: 'Retail', quarter: 'Q1', region: 'North America', revenue: 1250000, expenses: 1100000, profit: 150000, profit_margin: 0.12, growth_yoy: 0.08 },
  { id: 2, date: '2019-03-31', business_unit: 'Enterprise', quarter: 'Q1', region: 'North America', revenue: 1850000, expenses: 1340000, profit: 510000, profit_margin: 0.28, growth_yoy: 0.15 },
  { id: 3, date: '2019-03-31', business_unit: 'Digital', quarter: 'Q1', region: 'North America', revenue: 950000, expenses: 670000, profit: 280000, profit_margin: 0.29, growth_yoy: 0.22 },
  { id: 4, date: '2019-03-31', business_unit: 'Retail', quarter: 'Q1', region: 'Europe', revenue: 980000, expenses: 882000, profit: 98000, profit_margin: 0.10, growth_yoy: 0.05 },
  { id: 5, date: '2019-03-31', business_unit: 'Enterprise', quarter: 'Q1', region: 'Europe', revenue: 1420000, expenses: 1065000, profit: 355000, profit_margin: 0.25, growth_yoy: 0.12 },
  { id: 6, date: '2019-03-31', business_unit: 'Digital', quarter: 'Q1', region: 'Europe', revenue: 720000, expenses: 518400, profit: 201600, profit_margin: 0.28, growth_yoy: 0.18 },
  { id: 7, date: '2019-06-30', business_unit: 'Retail', quarter: 'Q2', region: 'North America', revenue: 1320000, expenses: 1148000, profit: 172000, profit_margin: 0.13, growth_yoy: 0.09 },
  { id: 8, date: '2019-06-30', business_unit: 'Enterprise', quarter: 'Q2', region: 'North America', revenue: 1920000, expenses: 1375000, profit: 545000, profit_margin: 0.28, growth_yoy: 0.14 },
  { id: 9, date: '2019-06-30', business_unit: 'Digital', quarter: 'Q2', region: 'North America', revenue: 1050000, expenses: 735000, profit: 315000, profit_margin: 0.30, growth_yoy: 0.25 },
  { id: 10, date: '2019-06-30', business_unit: 'Retail', quarter: 'Q2', region: 'Europe', revenue: 1050000, expenses: 924000, profit: 126000, profit_margin: 0.12, growth_yoy: 0.07 },
  { id: 11, date: '2019-06-30', business_unit: 'Enterprise', quarter: 'Q2', region: 'Europe', revenue: 1520000, expenses: 1125000, profit: 395000, profit_margin: 0.26, growth_yoy: 0.13 },
  { id: 12, date: '2019-06-30', business_unit: 'Digital', quarter: 'Q2', region: 'Europe', revenue: 780000, expenses: 546000, profit: 234000, profit_margin: 0.30, growth_yoy: 0.20 }
];

// Generic Dataset - Based on Customer Satisfaction Survey Data
export const RealGenericData = [
  { id: 1, dimension1: 'Product Quality', dimension2: 'Region X', segment: 'Enterprise', period: 'Q1', metric1: 8.5, metric2: 78, ratio: 0.109 },
  { id: 2, dimension1: 'Customer Service', dimension2: 'Region Y', segment: 'SMB', period: 'Q1', metric1: 7.2, metric2: 45, ratio: 0.160 },
  { id: 3, dimension1: 'Product Quality', dimension2: 'Region Z', segment: 'Consumer', period: 'Q1', metric1: 8.1, metric2: 82, ratio: 0.099 },
  { id: 4, dimension1: 'Delivery Speed', dimension2: 'Region X', segment: 'Enterprise', period: 'Q1', metric1: 6.8, metric2: 56, ratio: 0.121 },
  { id: 5, dimension1: 'Customer Service', dimension2: 'Region Z', segment: 'SMB', period: 'Q1', metric1: 7.9, metric2: 65, ratio: 0.122 },
  { id: 6, dimension1: 'Product Quality', dimension2: 'Region Y', segment: 'Consumer', period: 'Q2', metric1: 8.7, metric2: 81, ratio: 0.107 },
  { id: 7, dimension1: 'Customer Service', dimension2: 'Region X', segment: 'Enterprise', period: 'Q2', metric1: 7.6, metric2: 52, ratio: 0.146 },
  { id: 8, dimension1: 'Delivery Speed', dimension2: 'Region Z', segment: 'SMB', period: 'Q2', metric1: 7.1, metric2: 71, ratio: 0.100 }
];

// Function to get the appropriate dataset based on the type
export const getRealDataset = (datasetType: string): Array<Record<string, any>> => {
  switch (datasetType) {
    case 'Sales Data':
      return RealSalesData;
    case 'Marketing Data':
      return RealMarketingData;
    case 'Financial Data':
      return RealFinancialData;
    default:
      return RealGenericData;
  }
};
