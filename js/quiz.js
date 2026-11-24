// Practice question bank (ETG style: one OR several correct answers, zero partial credit).
// Q(theme, subtopicIndex, lessonIndex, question, options, correctLetters, explanation)
window.QUIZ = window.QUIZ || [];
function Q(t, s, l, q, o, a, e) { window.QUIZ.push({ id: `t${t}s${s}-${window.QUIZ.length}`, t, s, l, q, o, a: [...a].map((c) => 'ABCD'.indexOf(c)), e }); }

/* ================= THEME 1 · ROAD TRAFFIC ================= */
// Road signs
Q(1,0,0,'A triangular sign with a red border is a…',['Warning (danger) sign','Prohibition sign','Mandatory sign'],'A','Triangle + red border = panneau de danger. Round + red border = prohibition; round blue = obligation.');
Q(1,0,0,'In a built-up area, a warning sign is placed about how far before the danger?',['50 m','150 m','300 m'],'A','≈50 m in town, ≈150 m outside built-up areas.');
Q(1,0,0,'Outside built-up areas, warning signs are placed about…',['50 m before the danger','150 m before the danger','At the danger itself'],'B','Outside town the sign is ≈150 m ahead of the danger.');
Q(1,0,0,'A round sign with a blue background means…',['Something is compulsory','Something is forbidden','Information only'],'A','Round + blue = obligation (mandatory sign).');
Q(1,0,0,'A danger sign, then a prohibition sign, then a single supplementary panel below both. The panel applies to…',['Only the danger sign','Only the prohibition sign','Both signs'],'C','Rule to remember: danger sign + prohibition sign + panonceau → the panonceau applies to both.');
Q(1,0,0,'Several signs on one post are read…',['From top to bottom','From bottom to top','Most important first, whatever its position'],'A','Signs on a post are always read from top to bottom.');
Q(1,0,0,'A supplementary panel located between two signs applies to…',['The sign above it only','The sign below it only','Both signs'],'A','Between two signs, the panonceau only completes the first (upper) sign.');
Q(1,0,2,'Intersection markers (balises d’intersection)…',['Make the intersection visible','Tell you who has priority','Are only found in towns'],'A','They make intersections visible but do NOT indicate the order of priority.');
Q(1,0,2,'A bend marker with a red tip is found mainly…',['In areas often covered with snow','On motorways only','At level crossings'],'A','The red tip keeps the marker visible in snowy areas.');
Q(1,0,2,'A kilometre marker with a yellow top and the letter D tells you that you are on a…',['Departmental road','National road','Motorway'],'A','Yellow cartouche = route départementale (D). Red = A or N, green = E or F, white = C or R.');
Q(1,0,4,'On a direction sign, a red cartouche can mean…',['A motorway (A)','A national road (N)','A departmental road (D)','A European road (E)'],'AB','Red cartouche: A (autoroute) or N (nationale). D is yellow, E is green.');
Q(1,0,4,'On direction signs, a GREEN cartouche indicates…',['A European road (E)','A forest road (F)','A municipal road (C)'],'AB','Green: European (E) or forest (F) roads — the letter decides.');
Q(1,0,3,'A yellow traffic light means…',['Stop, unless stopping safely is no longer possible','Speed up to clear the junction','Same as green'],'A','Amber = mandatory stop, except if you can no longer stop safely.');
Q(1,0,3,'A flashing yellow arrow next to a red light allows you to…',['Go in the direction of the arrow, respecting priorities','Go in any direction','Ignore pedestrians'],'A','You may go in the arrow’s direction, giving way to pedestrians and traffic already on the road.');
Q(1,0,3,'Bus traffic lights apply to…',['Public transport and users authorised on the reserved lane','All vehicles','Only cyclists'],'A','Bus lights only concern public transport and other authorised users of the lane.');
Q(1,0,6,'You are behind a cyclist on a road with a solid centre line. You may…',['Straddle the solid line to overtake the cyclist','Never cross the line','Overtake only on the right'],'A','Exceptions to the solid line: overtaking a cyclist, an EDPM, a fixed obstacle or a mobile worksite.');
Q(1,0,6,'A deterrent line (ligne de dissuasion) allows you to overtake…',['Slow vehicles travelling under 60 km/h','Any vehicle','No vehicle at all'],'A','It discourages crossing; only slow vehicles (<60 km/h) may be overtaken.');
Q(1,0,6,'Fold-down arrows (flèches de rabattement) announce…',['A solid line ahead — do not start overtaking','A motorway exit','A pedestrian crossing'],'A','The announcement line + fold-down arrows warn that a solid line is coming. 3 arrows outside town, 2 in town.');
Q(1,0,6,'A mixed line is solid on my side and broken on the other side. I…',['May not cross it','May cross it to overtake','May straddle it briefly'],'A','You obey the line on your side: solid = no crossing.');
Q(1,0,6,'A solid edge line (ligne de rive) indicates…',['A one-way road','A two-way road','A cycle lane'],'A','Edge lines: solid = one-way, broken = two-way.');
Q(1,0,6,'A continuous yellow line along the kerb means…',['No stopping and no parking','No parking only','Delivery vehicles only'],'A','Continuous yellow = stopping and parking forbidden. Broken yellow = parking forbidden.');
Q(1,0,6,'Yellow zigzag markings in front of a bus stop prohibit…',['Stopping','Parking','Driving over them'],'AB','Zigzags forbid stopping and parking.');
Q(1,0,6,'The hatched area (zébras) on the road…',['Forbids driving','Forbids stopping','Forbids parking'],'ABC','Zébras forbid driving, stopping and parking.');
Q(1,0,7,'Temporary yellow signage for roadworks…',['Takes priority over permanent signs','Is only advice','Applies only to trucks'],'A','Temporary (yellow) signs always override permanent signage.');

// Intersections
Q(1,1,0,'At an intersection with no signs, no markings and no lights, you apply…',['Priority to the right','Priority to the left','The biggest vehicle goes first'],'A','No signage → priorité à droite.');
Q(1,1,0,'Which are “informal” clues that an intersection is coming?',['Rounded pavements','The corner of a building','A STOP sign','The indicator of the car ahead'],'ABD','A STOP sign is a formal clue (signage). Rounded pavements, building corners, crossings and indicators are informal.');
Q(1,1,1,'A STOP sign obliges you to…',['Stop completely at the line','Give way to all users','Only slow down if the road is clear'],'AB','STOP = complete stop at the line + give way.');
Q(1,1,1,'Leaving a private car park onto the road, you…',['Must give way to all traffic','Have priority to the right','Have priority if you indicate'],'A','Exiting a private road or car park, you never have priority.');
Q(1,1,1,'The yellow diamond sign means…',['You have priority until the end-of-priority sign','You have priority at the next junction only','Give way'],'A','Route à caractère prioritaire: priority until the end sign.');
Q(1,1,1,'A red-bordered triangle showing a thick black vertical bar crossed by a thin horizontal bar means you have priority…',['At the next intersection only','On the whole road','Never'],'A','Temporary priority sign (intersection où vous êtes prioritaire): only at the next junction.');
Q(1,1,1,'Two vehicles both have a STOP sign at the same junction. Who goes first?',['Priority to the right applies between them','The one going straight','The bigger vehicle'],'A','Same obligation for both → priority to the right decides.');
Q(1,1,2,'Arriving at a roundabout (carrefour à sens giratoire) with a YIELD sign, you…',['Give way to vehicles already on the ring','Have priority over vehicles on the ring','Must always stop'],'A','Giratoire: give way when entering; avoid stopping if the way is clear.');
Q(1,1,2,'At a roundabout you want to take the exit straight ahead. You use your right indicator…',['At the exit before yours','Before entering','You do not indicate'],'A','Straight on: stay right, indicate at the previous exit.');
Q(1,1,2,'To turn left at a two-lane roundabout, you…',['Position in the left lane','Return to the right lane by the previous exit','Stay in the left lane until you exit'],'AB','Left or U-turn: left lane, then move back right at the previous exit.');
Q(1,1,2,'At a traffic circle (rond-point) with no signs and no markings…',['Priority to the right applies','Vehicles entering the ring have priority','Vehicles on the ring always have priority'],'AB','A rond-point follows priorité à droite, so entering vehicles have priority. Once on the ring, give way to those entering.');
Q(1,1,3,'A police officer directs traffic at a junction with working lights. You obey…',['The officer','The lights','The signs'],'A','Officers’ instructions override signs and traffic lights.');
Q(1,1,3,'Traffic lights are off or flashing amber, with no sign underneath. You…',['Apply priority to the right','Have priority','Must stop and wait'],'A','Out-of-order lights with no sign → priority to the right.');
Q(1,1,3,'The light is green but the junction beyond is blocked. You…',['Wait before the junction','Enter and wait in the middle','Sound your horn'],'A','Never enter a junction you can’t clear before the light turns red.');
Q(1,1,3,'Construction-site traffic lights are used to…',['Alternate traffic on one remaining lane','Mark a speed camera','Signal a railway'],'A','Temporary lights for alternating one-way traffic.');

// Circulate
Q(1,2,0,'On a normal road you must drive…',['In the right-hand lane','As close as is safe to the right edge','In the centre of the road'],'AB','Keep right, as close to the edge as safely possible.');
Q(1,2,0,'Traffic queues are continuous on all lanes. You may…',['Stay in your lane','Move ahead of vehicles on your left','Change lane to turn'],'ABC','In uninterrupted queues, passing on the right is allowed and you may change lane to change direction.');
Q(1,2,1,'The correct order before a change of direction is…',['Mirrors and blind spot → indicator → position','Indicator → position → mirrors','Position → indicator → mirrors'],'A','Rétro + angle mort, clignotant, placement.');
Q(1,2,1,'Turning right at a junction, you must…',['Keep close to the right edge','Give way to pedestrians crossing','Give way to cyclists on a cycle lane on your right'],'ABC','Hug the right edge and yield to pedestrians and users of reserved lanes on your right.');
Q(1,2,1,'Turning left on a two-way road, you…',['Position near the centre line','Give way to oncoming vehicles','Give way to pedestrians'],'ABC','Move to the centre or dedicated lane, yield to oncoming traffic and pedestrians.');
Q(1,2,1,'In an “Indonesian-style” junction, two vehicles turning left…',['Pass in front of each other','Pass behind each other','Must reverse'],'A','Indonesian style: they pass face to face (in front of each other). Classic: one behind the other.');

// Speed
Q(1,3,0,'Visibility is under 50 m because of fog. Maximum speed is…',['50 km/h on all roads','70 km/h','90 km/h outside town'],'A','Visibility < 50 m → 50 km/h maximum, whatever the road.');
Q(1,3,0,'In a meeting zone (zone de rencontre), the speed limit is…',['20 km/h','30 km/h','50 km/h'],'A','Zone de rencontre = 20 km/h; pedestrians have priority.');
Q(1,3,0,'On the motorway in rain, an experienced driver is limited to…',['110 km/h','100 km/h','130 km/h'],'A','Motorway 130 → 110 in rain.');
Q(1,3,0,'On a dual carriageway limited to 110 km/h, in the rain the limit becomes…',['100 km/h','90 km/h','110 km/h'],'A','110 → 100 km/h in rain.');
Q(1,3,0,'A speed display sign (radar pédagogique)…',['Shows your speed','Never issues a fine','Sends a ticket if you speed'],'AB','It only displays your speed.');
Q(1,3,0,'An average-speed (section) camera…',['Calculates your average speed between two points','Only measures at a single point','Records your licence plate and time'],'AC','Le radar tronçon computes average speed between A and B using plate and time.');
Q(1,3,0,'An automatic speed camera ticket is sent to…',['The registered owner of the vehicle','The driver’s employer','Nobody — only a warning'],'A','The fine goes to the holder of the registration certificate.');
Q(1,3,1,'At 80 km/h your field of vision shrinks to about…',['60°','120°','180°'],'A','180° stopped, ~60° at 80 km/h, 30° or less faster: tunnel vision.');
Q(1,3,1,'Kinetic energy depends on…',['The speed','The weight of the vehicle','The colour of the car'],'AB','Speed (most strongly) and mass.');
Q(1,3,1,'Centrifugal force in a bend increases when…',['Speed increases','The bend is tighter','The vehicle is heavier'],'ABC','All three increase centrifugal force.');
Q(1,3,1,'To limit centrifugal force, you should…',['Slow down before the bend','Brake hard in the middle of the bend','Steer smoothly'],'AC','Adapt speed BEFORE the bend and avoid sudden movements.');

// Cross and overtake
Q(1,4,0,'To pass an oncoming vehicle on a narrow road, you…',['Slow down','Keep to the right','Flash your lights'],'AB','Slow down and move right to keep lateral distance.');
Q(1,4,0,'A vehicle wider than 2 m or longer than 7 m must…',['Stop to let smaller vehicles pass when crossing is difficult','Always have priority','Use its hazard lights'],'A','Large vehicles must slow/stop to make passing easier.');
Q(1,4,0,'An obstacle is on YOUR side of the road. Who passes first?',['The oncoming vehicle','You','The faster vehicle'],'A','The vehicle that must swerve around the obstacle gives way.');
Q(1,4,0,'On a steep mountain road, two cars of the same size can’t pass. Who has priority?',['The one going uphill','The one going downhill','The one closest to a passing place'],'A','Same size → uphill has priority; the descending one reverses.');
Q(1,4,0,'A car meets a lorry on a narrow slope. Who gives way?',['The car (more manoeuvrable)','The lorry','The one going downhill'],'A','When sizes differ, the more manoeuvrable vehicle gives way.');
Q(1,4,1,'Overtaking on the RIGHT is allowed when…',['The vehicle ahead is turning left','The left lane is stationary in a traffic jam','You are in a hurry','You are taking a different direction'],'ABD','Exceptions: vehicle turning left, different direction, standstill on the left.');
Q(1,4,1,'When overtaking you should be at least … faster than the vehicle being overtaken.',['20 km/h','5 km/h','50 km/h'],'A','At least 20 km/h faster, within the speed limit.');
Q(1,4,1,'You may pull back in after overtaking when…',['You can see the whole overtaken vehicle in your interior mirror','Your front is level with its front','It flashes its lights'],'A','See the entire vehicle in your mirror before moving back.');
Q(1,4,1,'When being overtaken, you should…',['Keep a steady speed','Move to the right','Accelerate so they pass faster'],'AB','Keep your speed and keep right; only slow down in an emergency.');
Q(1,4,1,'Overtaking a cyclist outside a built-up area, the minimum lateral gap is…',['1.50 m','1 m','50 cm'],'A','1 m in town, 1.50 m outside.');

// Park or stop
Q(1,5,0,'Dropping off a passenger while you stay at the wheel is…',['A stop (arrêt)','Parking (stationnement)'],'A','Stopping = brief, driver at or in the vehicle.');
Q(1,5,0,'A no-parking sign applies…',['From the sign to the next intersection','On the side where the sign is','On the shoulder and pavement too','On both sides of the road'],'ABC','From the sign, until the next junction, on that side only.');
Q(1,5,0,'On a delivery space marked with broken yellow lines, you may park…',['At night (8 pm–7 am), Sundays and public holidays','Never','At any time for 10 minutes'],'A','Broken lines = shared space at night and on Sundays/holidays (times can vary locally). Stopping is always allowed.');
Q(1,5,1,'Free time-limited parking (blue zone) requires…',['A parking disc showing your arrival time','A ticket from the meter','Nothing'],'A','Display the disque de stationnement behind the windscreen.');
Q(1,5,2,'With semi-monthly alternating parking, from the 1st to the 15th you park on…',['The odd-numbered side','The even-numbered side','Either side'],'A','1st–15th: odd side; 16th–end: even side.');
Q(1,5,3,'On a two-way street, you must park…',['On your right in the direction of travel','On the left if spaces are free','Anywhere'],'A','Parking on the left would put you facing traffic.');
Q(1,5,3,'Which stops/parking are classed as VERY obstructive (très gênant)?',['On a pavement','Within 5 m before a pedestrian crossing','On a bus lane','On a bridge'],'ABC','A bridge is “gênant”. Pavements, cycle/bus lanes, 5 m before a crossing and CMI spaces are “très gênant”.');
Q(1,5,3,'Parking near the top of a hill (crest) is…',['Dangerous','Allowed if you put the hazard lights on','Only obstructive'],'A','Near an intersection, bend, crest or level crossing = dangerous.');
Q(1,5,3,'Outside built-up areas you should preferably park…',['On the shoulder to your right','On the road with hazard lights','On a cycle path'],'A','Use the right-hand shoulder so you are not an obstacle.');

/* ================= THEME 2 · THE DRIVER ================= */
Q(2,0,0,'Peripheral vision mainly lets you…',['Detect movement and contrast','Read road signs','Judge distances precisely'],'A','Peripheral vision spots movement and alerts central vision.');
Q(2,0,0,'Before changing direction you check the blind spot by…',['Turning your head','Using only the interior mirror','Using only the door mirror'],'A','Blind spots are invisible in mirrors — a head check is required.');
Q(2,0,2,'Hazard lights are used to warn of…',['A breakdown','A sudden traffic jam','An accident','A thank-you to another driver'],'ABC','Feux de détresse: breakdown, sudden slowdown, accident.');
Q(2,0,2,'The horn should be used…',['To signal an immediate danger','To express impatience','In moderation'],'AC','Only for immediate danger, sparingly.');
Q(2,0,3,'Average reaction time is about…',['1 second','3 seconds','0.2 seconds'],'A','≈1 s, up to 2 s or more when tired, drunk, etc.');
Q(2,0,3,'At 80 km/h, the distance travelled during 1 second of reaction is about…',['24 m','8 m','64 m'],'A','Tens digit × 3 = 8 × 3 = 24 m.');
Q(2,0,3,'Stopping distance on a DRY road at 80 km/h is about…',['64 m','48 m','96 m'],'A','Tens digit squared: 8 × 8 = 64 m.');
Q(2,0,3,'Stopping distance on a WET road at 80 km/h is about…',['96 m','64 m','128 m'],'A','Dry 64 m + half (32 m) = 96 m.');
Q(2,0,3,'Stopping distance =',['Reaction distance + braking distance','Braking distance only','Safety distance × 2'],'A','REACTION + BRAKING = STOPPING.');
Q(2,0,3,'The safety distance corresponds to…',['2 seconds','1 second','4 seconds'],'A','Distance de sécurité = 2 seconds (≈ tens digit × 6 m).');
Q(2,0,3,'At 130 km/h on the motorway, a safe gap equals…',['2 hard-shoulder lines','1 hard-shoulder line','5 lines'],'A','130 km/h = 2 lines; 110 km/h = 1½ lines.');
Q(2,0,3,'At 90 km/h, the safe following distance is about…',['54 m','27 m','81 m'],'A','Tens digit × 6 = 9 × 6 = 54 m.');
Q(2,1,0,'Is a medical exam required to KEEP a category B licence?',['No — each driver must judge their own fitness','Yes, every 5 years','Yes, after 70'],'A','No exam is required to keep the B licence; the driver is responsible.');
Q(2,1,1,'A driver behind flashes his lights to push you to go faster (you are at the limit). You…',['Keep your speed and position','Speed up','Brake suddenly'],'A','Don’t give in to pressure from others.');
Q(2,1,2,'Minimum visual acuity for the B licence (both eyes, with correction) is…',['5/10','8/10','3/10'],'A','5/10 minimum; code 01 if glasses/lenses are needed.');
Q(2,1,2,'Wearing earphones or headphones while driving is…',['Forbidden','Allowed at low volume','Allowed in one ear'],'A','Forbidden — hearing is a safety sense.');
Q(2,1,3,'A standard drink served in a bar contains…',['10 g of pure alcohol','20 g','5 g'],'A','All standard drinks ≈ 10 g → 0.20–0.25 g/L of blood.');
Q(2,1,3,'For an experienced driver, the legal limit is…',['0.5 g/L of blood','0.25 mg/L of exhaled air','0.8 g/L of blood'],'AB','0.5 g/L blood = 0.25 mg/L air.');
Q(2,1,3,'During the probationary period, the limit is…',['0.2 g/L of blood','0.1 mg/L of exhaled air','0.5 g/L of blood'],'AB','0.2 g/L = 0.1 mg/L — effectively zero drinks.');
Q(2,1,3,'0.40 mg/L of exhaled air corresponds to…',['0.80 g/L of blood','0.20 g/L of blood','0.40 g/L of blood'],'A','Air measure is always half the blood measure.');
Q(2,1,3,'The body eliminates on average per hour…',['0.10 to 0.15 g/L','0.5 g/L','0.02 g/L'],'A','So about 2 h 30 for one glass.');
Q(2,1,3,'What speeds up the elimination of alcohol?',['Coffee','Drinking water','Nothing — only time'],'C','Only time removes alcohol (mainly via the liver).');
Q(2,1,3,'An alcohol screening test is COMPULSORY after…',['An accident with injuries','A fatal accident','Failure to respect a priority sign','A minor fender bender'],'ABC','Mandatory after bodily/fatal accidents and certain offences; only possible after material accidents.');
Q(2,1,4,'Compared with alcohol, cannabis stays detectable…',['Much longer (days)','Shorter','The same'],'A','≈2 h for a glass of alcohol vs ≈3 days for a joint.');
Q(2,1,4,'Driving under drugs AND alcohol together is punished by up to…',['5 years in prison','€15,000 fine','9 points deducted (per the course)'],'ABC','The course lists 5 years, €15,000 and 9 points.');
Q(2,1,5,'A medicine box shows a level 3 pictogram (red). You…',['Must not drive','May drive if you feel fine','Must read the leaflet only'],'A','Level 3 = danger, do not drive; seek medical advice to resume.');
Q(2,1,5,'Level 2 (orange) pictogram means…',['Be very careful — consult a health professional before driving','No effect on driving','Never drive'],'A','Level 1 yellow: be careful; level 2 orange: very careful; level 3 red: don’t drive.');
Q(2,1,6,'Which really fight drowsiness at the wheel?',['Stopping to rest','Handing over to another driver','Opening the window','Drinking coffee'],'AB','Coffee, chewing gum, open windows do not work — only stopping or changing driver.');
Q(2,1,6,'Recommended breaks are…',['At least 15 minutes every 2 hours','5 minutes every 4 hours','Only when you feel tired'],'A','15 min every 2 h.');
Q(2,1,7,'Using a hands-free kit while driving…',['Still distracts your attention','Is perfectly safe','Reduces reaction time'],'A','Phone conversations demand cognitive attention even hands-free.');

/* ================= THEME 3 · THE ROAD ================= */
Q(3,0,0,'Passing from bright sun into shade, your eyes need…',['More than 3 seconds to adapt','Less than half a second','No time at all'],'A','Glare increases reaction time; slow down.');
Q(3,0,1,'On a lit road outside built-up areas at night, you use…',['Dipped headlights','Position lights only','High beams'],'A','Outside town on a lit road: dipped beams.');
Q(3,0,1,'At night, alone on an unlit road, you use…',['High beams','Dipped headlights','Fog lights only'],'A','Feux de route when nobody is ahead or oncoming.');
Q(3,0,1,'You are dazzled by oncoming headlights. You…',['Look towards the right edge of the road','Stare at the headlights','Switch on your high beams'],'A','Look to the right edge and slow down.');
Q(3,0,2,'In the rain you must use…',['Dipped headlights','Rear fog light','High beams'],'A','Rain: dipped beams; front fog lights may be added in heavy rain. Never rear fog light for rain.');
Q(3,0,2,'Braking distance on a wet road is about…',['Twice as long as on dry','The same','Half as long'],'A','Wet road ≈ ×2 braking distance.');
Q(3,0,2,'Aquaplaning can occur…',['Even with tyres in good condition','Only with worn tyres','Only above 130 km/h'],'A','Heavy rain can cause aquaplaning even with good tyres.');
Q(3,0,2,'The first rain after a long dry spell makes the road…',['Especially slippery (oil, fuel)','Safer','No different'],'A','Oil and fuel residues make it very slippery.');
Q(3,0,3,'In thick fog you should use…',['Front fog lights','Rear fog light','Dipped headlights'],'ABC','See and be seen: fog lights front and rear (plus dipped beams).');
Q(3,0,3,'Visibility is 70 m in fog. The “three equalities” rule says…',['Drive at 70 km/h max','Keep a 70 m gap','Drive at 50 km/h'],'AB','Visibility 70 m = 70 km/h = 70 m gap.');
Q(3,0,3,'When the fog clears you switch off the rear fog light because…',['It dazzles drivers behind','It drains the battery','It is illegal by day'],'A','Rear fog lights dazzle following users.');
Q(3,0,4,'The Mountain Law (loi Montagne) applies…',['From 1 November to 31 March','In 48 mountain departments','All year in all of France'],'AB','Winter period 1 Nov–31 Mar, 48 departments.');
Q(3,0,4,'Under the Mountain Law you must…',['Fit 4 winter tyres','Or carry chains for at least 2 drive wheels','Fit studded tyres only'],'AB','Winter tyres on 4 wheels, or chains/socks in the boot.');
Q(3,0,4,'On black ice you should…',['Steer gently','Accelerate gently','Brake hard','Slow down gradually well in advance'],'ABD','Smooth inputs only — no hard braking.');
Q(3,0,4,'Keeping snow chains on a dry road is…',['Forbidden — they damage the road','Recommended','Required until the end of the zone'],'A','Remove chains on clear roads.');
Q(3,0,5,'Strong crosswind: you should…',['Hold the steering wheel firmly','Reduce your speed','Overtake lorries quickly'],'AB','Grip the wheel and slow down; beware when passing HGVs.');
Q(3,1,0,'Which users are BANNED from the motorway?',['Pedestrians and cyclists','Mopeds','Agricultural vehicles','Motorcycles over 125 cm³'],'ABC','Also quadricycles, tricycles and horse riders.');
Q(3,1,0,'On the motorway it is forbidden to…',['Reverse','Make a U-turn','Drive on the hard shoulder','Overtake on the left'],'ABC','Plus crossing the central reservation.');
Q(3,1,0,'On a 3-lane motorway, in normal traffic you drive in…',['The right-hand lane','The middle lane','The left lane'],'A','Keep right; the other lanes are for overtaking.');
Q(3,1,1,'Joining the motorway from the acceleration lane, you…',['Do not have priority','Have priority','Must stop at the end'],'A','You must merge without priority, matching traffic speed.');
Q(3,1,1,'The slow-vehicle lane on a climb must be used by vehicles travelling at…',['60 km/h or less','90 km/h or less','40 km/h or less'],'A','≤ 60 km/h, including HGVs.');
Q(3,1,1,'A diamond symbol on a motorway lane sign indicates…',['A carpool lane (2+ occupants)','A bus-only lane','A slow lane'],'A','Voie de covoiturage: 2+ people, buses, taxis, emergency vehicles…');
Q(3,1,1,'Approaching a toll you should…',['Switch off cruise control','Choose the lane matching your payment method','Reverse if you chose the wrong lane'],'AB','No reversing at the toll.');
Q(3,1,2,'The leading cause of fatal accidents on motorways is…',['Fatigue and drowsiness','Rain','Wildlife'],'A','Monotony → drowsiness. Take a break every 2 hours.');
Q(3,1,2,'You are last in a sudden motorway queue. You…',['Slow down gradually','Switch on hazard lights','Drive on the hard shoulder'],'AB','Warn following drivers with hazard lights.');
Q(3,1,2,'After a breakdown on the motorway you…',['Put on your hi-vis vest','Get out on the guardrail side','Wait behind the guardrail','Place your warning triangle'],'ABC','Never place a triangle on a motorway.');
Q(3,1,2,'Emergency phones on the motorway are about every…',['2 km','10 km','500 m'],'A','Every 2 km; never cross the motorway to reach one.');
Q(3,1,2,'On a long descent you should preferably use…',['Engine braking','The brake pedal continuously','Neutral'],'A','Release the accelerator and downshift.');
Q(3,2,0,'Temporary road markings for roadworks are…',['Yellow','White','Blue'],'A','Temporary markings are always yellow.');
Q(3,2,0,'Approaching roadworks where a lane will close, you…',['Change lane early','Merge at the last moment at speed','Let merging drivers in'],'AC','Anticipate and make merging easy for others.');
Q(3,2,1,'Entering a tunnel you must…',['Switch on dipped headlights','Remove sunglasses','Switch on high beams'],'AB','Dipped beams on, sunglasses off.');
Q(3,2,1,'In a tunnel, the safety gap between cars is…',['2 blue lights','3 blue lights','1 blue light'],'A','2 blue LEDs for cars (3 for heavy vehicles), even when stopped.');
Q(3,2,1,'Your car breaks down in a tunnel. You…',['Switch on hazard lights','Switch off the engine','Call from an emergency niche rather than a mobile'],'ABC','Emergency phones locate you precisely.');
Q(3,2,1,'A fire breaks out in ANOTHER vehicle in the tunnel. You…',['Stop, switch off the engine','Leave the keys in the ignition','Walk to the nearest emergency exit','Make a U-turn'],'ABC','U-turns are forbidden in tunnels.');
Q(3,2,1,'In a tunnel traffic jam you should…',['Switch on hazard lights','Recirculate the cabin air','Get out and walk around'],'AB','Then switch off the engine and stay in the car (stationary traffic).');
Q(3,2,2,'At an unguarded level crossing (no barriers)…',['The train always has priority','Check no train is coming','Accelerate to cross quickly'],'AB','Train first, always.');
Q(3,2,2,'Outside built-up areas, a level-crossing marker with 3 red stripes is about…',['150 m from the crossing','50 m','300 m'],'A','1 stripe 50 m, 2 = 100 m, 3 = 150 m.');
Q(3,2,2,'The flashing red light at a level crossing means…',['Stop — like a red traffic light','Slow down','Train has passed'],'A','Never cross on a flashing red light, even on foot.');
Q(3,2,2,'Your car is stuck between the barriers and the alarm rings. You…',['Abandon the car and get out quickly','Try to restart','Wait for help inside'],'A','Get out immediately, then alert.');
Q(3,2,2,'Level-crossing barriers are designed to…',['Break if a vehicle is trapped','Never break','Lift automatically when you hoot'],'A','Barriers are breakable — then you must alert.');
Q(3,2,3,'Regarding trams, it is forbidden to overtake…',['A stationary tram','A moving tram on the right','A moving tram on the left'],'A','You may overtake a MOVING tram, even on the right, but never a stationary one.');
Q(3,2,3,'Why must you always give way to a tram?',['It cannot swerve','It has long braking distances','It is lighter than a car'],'AB','A tram follows its rails; it can only brake.');
