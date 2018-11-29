module.exports.info = {
    "CGPL": "If net export is 3300 to 3500 MW and one double circuit of 400kV CGPL-Bachhau trips, trip Unit-40. \
    If net export is more than 3500 MW and if one double circuit of 400kV CGPL-Bhachau trips, trip Unit 40 & create run back in other selected unit, so as to keep remaining circuit loading within 1200 MW per circuit. \
    If all units in service at CGPL, any one line trips from CGPL, and fault does not clear with in 100 milliseconds, trip unit 40 in next 20 msec, that is, with in 120 milli seconds unit 40 will trip",
    
    "Gwalior Agra": "If Sudden reduction of import by NR on Agra-Gwalior I & II by more than or equal to 1500 MW, then \
    Generation Backing down in WR of 500 MW, CGPL: 125 MW, Korba: 125 MW, Vindhyachal: 125 MW, Sasan: 125 MW. \
    Load Shedding in NR: Shed load of group C, D, E and F. \
    If Sudden reduction of import by NR on Agra-Gwalior I & II by more than or equal to 1000 MW and less than 1500 MW, in Northern Region Shed load of group C and D. \
    When both 765 kV Agra-Gwalior Lines are in service and steady state flow crosses 3600 MW Total in West to North for more than 10 seconds, in Northern Region Shed load of group C and D. \
    When only one 765 kV Agra-Gwalior Line is in service and steady state flow crosses 2500 MW Total In West to North for more than 10 seconds, in Northern Region Shed load of group C and D.",
    
    "Raichur Solapur": "If the total flow on 765 kV Solapur-Raichur double circuit is more than 3000 MW and remains for 5 seconds in Solapur to Raichur direction sensed by both at Sholapur and Raichur, \
    R S 2 545 MW group load Shed in SR Grid. If the Flow remains above 3000 MW for further 2.5 seconds, additional R S 3 633 MW group load will be shed. \
    If Loss of import by SR on 765 kV Solapur-Raichur Double Circuit by more than 1500 MW due to tripping of these lines, Load Shedding in SR R S 1, R S 2 and R S 3",
    
    "Wardha Nizamabad": "",
    
    "SASAN": "If one 765 kV lines trips, No reduction automatic. \
    If two 765 kV lines trip and current on last circuit exceeds 2000 Amperes, Trip 1 Unit immediately and if above condition is still satisfied then trip another Unit. (Generation Ex bus reduces to 2400 MW).\
    If all circuit trip and current in either of 765/400 kV ICTs is more than 800 amperes, Trip one Unit followed by tripping of another unit in next 5 seconds if condition is still satisfied. If after tripping of two units, yet the condition is satisfied trip the third unit in next 5 seconds. (Generation Ex bus reduces to 1800 MW).",
    
    "Mundra Mohendragarh": "If total generation at APL,Mundra is above 3500MW and Loss of Both Poles of HVDC Mundra Mohindergarh, \
    Trip of one Unit from 7 to 9 as per selection if all units are running.",
    
    "J P Nigrie": "If one 400 kV JP Nigrie-Satna circuit trips and generation is more than 800 MW, automatic Generation reduction to 800 MW",

    "M B Power": "If one 400 kV MB Power-Jabalpur circuit trips and generation is more than 800 MW, automatic Generation reduction to 800 MW",

    "JPL": "If Generation at JPl is full and one circuit of 400 kV JPL-Raipur double circuit and 400 kV JPL-JPL Extension trips or One of the line is out of service and other circuit trips, Ex Bus Generation at JPL to be brought to 590 MW (One unit of 250 MW and 2 Unit of 135 MW along with 60 MW of Generation reduction in 3-4 Minutes. \
    If Sudden Reversal of Power on JPL-JPL Extension due to N-1-1 contingency of 765 kV Tamnar-Kotra lines, trip one unit of 600 MW and immediate backing down at other Unit in JPL extension so that Ex Bus generation of JPl plus JPl Extension should not exceed 1160 MW. \
    If all four 400 kV lines from JPL Extension-Tamnar to be in service if JPL Extension generation is more than 600 MW.",

    "Essar Mahan": "When the breaker position at Mahan is open for Vindhyachal line or Power flow towards Vindhyachal less than 12 MW for at least 1 sec, Trip 600 MW unit at Mahan immediately so that there is no injection towards Korba",

    "Sipat": "Alarm in case of ICTs loading exceeds 100 % for 5 seconds. \
    If any ICTs load exceeds 130% of the rated load for more than 4 sec, unload unit 1,2,4 and 5 each by 150MW (subject to minimum loading of 500MW in stage-1 units and subject to minimum loading of 350MW in stage-2 units). \
    If any ICTs load remains above 130% even after unloading unit 1,2,4 and 5, Unload Unit 3 by 150 MW after 300 sec (subject to minimum loading of 500 MW.) \
    Once the load has reduced below 130%, manual action to reduce to bring down ICT loading below 100%",

    "KSK": "If Generation at KSK is more than 1200 MW and one circuit of 400kV KSK-Champa double circuit trips, \
    trip one unit KSK Mahanadi"
};








