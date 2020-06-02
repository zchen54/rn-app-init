export const IndustryList = [
  {
    groupID: "01",
    groupName: "IT",
    sub: [
      { id: "01", name: " Software " },
      { id: "02", name: " Hardware " },
      { id: "03", name: " Ecommerce" },
      { id: "04", name: " Gaming " },
      { id: "05", name: " Telecom " },
      { id: "06", name: " Others " }
    ]
  },
  {
    groupID: "02",
    groupName: "Manufacture",
    sub: [
      { id: "07", name: " Cosmetics " },
      { id: "08", name: " Food&Beverage " },
      { id: "09", name: " Clothing " },
      { id: "10", name: " Electronics " },
      { id: "11", name: " Medicine " },
      { id: "12", name: " Furniture" },
      { id: "13", name: " General Equipment" },
      { id: "14", name: " Others" }
    ]
  },
  {
    groupID: "03",
    groupName: "Trade",
    sub: [
      { id: "15", name: " Imports/Exports " },
      { id: "16", name: " Wholesale " },
      { id: "17", name: " Stores" },
      { id: "18", name: " Tele Sales " },
      { id: "19", name: " Retail " },
      { id: "20", name: " Others " }
    ]
  },
  {
    groupID: "04",
    groupName: "Construction",
    sub: [
      { id: "21", name: " Architectural Design " },
      { id: "22", name: " Building Materials " },
      { id: "23", name: " Home Building " },
      { id: "24", name: " Building Administrative Agencies " },
      { id: "25", name: " Construction services " },
      { id: "26", name: " Housing " },
      { id: "27", name: " Installation " },
      { id: "28", name: " Decoration " },
      { id: "29", name: " Others " }
    ]
  },
  {
    groupID: "05",
    groupName: "Finance",
    sub: [
      { id: "30", name: " Banking " },
      { id: "31", name: " Insurance " },
      { id: "32", name: " Investment " },
      { id: "33", name: " Others " }
    ]
  },
  {
    groupID: "06",
    groupName: "Services",
    sub: [
      { id: "34", name: " Hotels " },
      { id: "35", name: " Food&Beverage " },
      { id: "36", name: " Entertainments " },
      { id: "37", name: " Travel " },
      { id: "38", name: " Ticketing " },
      { id: "39", name: " Hospital " },
      { id: "40", name: " Plastic Surgery " },
      { id: "41", name: " Pharmacy " },
      { id: "42", name: " Accounting " },
      { id: "43", name: " Human Resource " },
      { id: "44", name: " Legal " },
      { id: "45", name: " Others " }
    ]
  },
  {
    groupID: "07",
    groupName: "Education",
    sub: [
      { id: "46", name: " Universities " },
      { id: "47", name: " Middle School " },
      { id: "48", name: " Primary School" },
      { id: "49", name: " Kindergarten " },
      { id: "50", name: " Skills Training " },
      { id: "51", name: " Others " }
    ]
  },
  {
    groupID: "08",
    groupName: "Media",
    sub: [
      { id: "52", name: " Journalist " },
      { id: "53", name: " Advertisment " },
      { id: "54", name: " Broadcasting " },
      { id: "55", name: " Film&TV " },
      { id: "56", name: " Publishing " },
      { id: "57", name: " Others " }
    ]
  },
  {
    groupID: "09",
    groupName: "Government",
    sub: [
      { id: "58", name: " Party Committee" },
      { id: "59", name: " Civil Affairs " },
      { id: "60", name: " Police " },
      { id: "61", name: " Business Bureau " },
      { id: "62", name: " Supervision " },
      { id: "63", name: " Others " }
    ]
  },
  {
    groupID: "10",
    groupName: "Organizations",
    sub: [
      { id: "64", name: " Public Service " },
      { id: "65", name: " Religious " },
      { id: "66", name: " Student " },
      { id: "67", name: " International " },
      { id: "68", name: " Non-Profit " },
      { id: "69", name: " Others " }
    ]
  },
  {
    groupID: "11",
    groupName: "Mining",
    sub: [
      { id: "70", name: " Coal " },
      { id: "71", name: " Oil/Natural Gas " },
      { id: "72", name: " Metal " },
      { id: "73", name: " Others " }
    ]
  },
  {
    groupID: "12",
    groupName: "Friends and Relatives",
    sub: [
      { id: "74", name: " Family " },
      { id: "75", name: " Classmates " },
      { id: "76", name: " Friends " }
    ]
  }
];

export const filterIndustryById = (id: string) => {
  let industryName = "";
  IndustryList.forEach((groupItem: any) => {
    groupItem.sub.forEach((item: any) => {
      if (item.id === id) {
        industryName = item.name;
      }
    });
  });
  return industryName;
};
