/* ==========================================================================
   ZONE EXTRAS — the Architect's Record (his résumé, one page per zone) and the Throne lights.
   A record is read like an inscription but is not one of the 20: it sets G.flags[id], gives 15 points.
   Points: 10 (arrival) + 20 x 15 (inscriptions) + 6 x 15 (records) + 99 (the Throne) = 499. One point remains.
   ========================================================================== */
{
  const rec = (zone, where, n) => ZONES[zone].props.push(Object.assign(
    { t: 'note', cv: true, id: 'cv_' + zone, dlg: 'cv_' + zone, label: 'ui.read_the_architects_record', spr: 'note_stele' }, where));
  rec('workshop',   { at: [146, 35] });       // each record stands at the END of its zone, just before the door
  rec('forest',     { at: [176, 29] });
  rec('cathedral',  { at: [186, 33] });
  rec('catacombs',  { at: [178, 27] });
  rec('repository', { at: [186, 29] });
  rec('arena',      { x: 345 });

  // TODO_ART (M2): the Throne is still a stand-in room; until then it is simply lit well enough to fight in
  const A = ZONES.arena, col = Math.round(A.bossX / 16);
  A.lights.push({ at: [col, 12], r: 210, c: 'rune', steady: true });
  for (let c = 4; c < 60; c += 9) A.lights.push({ at: [c, 15], r: 150, c: 'dim', steady: true });
}

/* A quiet side room entered from the last stretch of the forest. */
ZONES.forest.props.push({ t: 'gate', at: [181, FG], to: 'dojo', name: 'zone.dojo.short', label: 'ui.enter_the_dojo' });
ZONES.forest.lights.push({ at: [181, FG - 3], r: 100, c: 'gold', steady: true });
ZONES.dojo = {
  id: 'dojo', name: 'zone.dojo.name', sub: 'zone.dojo.sub', mood: 'forest', map: 'dojo', atlas: 'workshop', lut: 'identity', lockCam: true,
  spawn: { left: [5, 19], right: [5, 19] }, ambient: [122, 108, 112],
  decor: [
    ...[2, 13, 29, 41].map((c) => ({ s: 'pillar', at: [c, 19], layer: 'back' })),
    ...[6, 16, 26, 36].map((c) => ({ s: 'rafter', at: [c, 5], layer: 'back' })),
    ...[7, 22, 35].map((c) => ({ s: 'dojo_shoji', at: [c, 19], dy: -68, layer: 'back' })),
    { s: 'dojo_scroll', at: [16, 19], dy: -74, layer: 'back' },
    { s: 'dojo_scroll', at: [31, 19], dy: -74, layer: 'back' },
    { s: 'dojo_rack', at: [10, 19], layer: 'back' },
    { s: 'shelf', at: [36, 19], dy: -28, layer: 'back' },
    ...[7, 18, 28, 38].map((c) => ({ s: 'dojo_lantern', hang: [c, 2], dy: 4 }))
  ],
  props: [ { t: 'gate', at: [3, 19], to: 'forest', name: 'zone.forest.short', label: 'ui.leave_the_dojo' }, { t: 'note', at: [19, 19], id: 'dojo_board', dlg: 'dojo_board', label: 'who.dojo_sign' } ],
  lights: [ {at:[11,12],r:145,c:'gold',steady:true}, {at:[31,15],r:135,c:'gold',steady:true} ]
};
