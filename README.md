# Can Kyoto

Web del restaurant Can Kyoto, fusió mediterrània i japonesa al Poblenou (Barcelona).
Projecte ASIX 0379 (curs 26/27) de Jan i Josep. Publicada amb GitHub Pages.

## Pàgines

- `index.html`: portada, la sala en directe, la cuina, la taula que et reconeix, xifres i on som.
- `reserves.html`: reserva en tres passos (dia i persones, hora i taula, dades del client).
- `carta.html`: la carta, un flipbook de Heyzine incrustat, en català, castellà i anglès.

## Carpetes

- `css/style.css`: tot el disseny de la web, en un sol fitxer.
- `js/taules.js`: la llista de les 10 taules (número, places i posició al plànol). La fan servir les dues pàgines.
- `js/sala.js`: pinta el plànol de la portada amb les taules lliures i ocupades.
- `js/reserves.js`: el procés de reserva.
- `js/menu.js`: ensenya el logo petit al menú de la portada quan baixes.
- `js/carta.js`: canvia l'idioma del flipbook de la carta.
- `img/`: logotip i foto de la sala.
- `php/`: reservat per a la part de servidor.

## Quan canviïs el CSS o el JS

Els fitxers s'enllacen amb un número de versió (`style.css?v=2`). Quan en canviïs un, puja el número
a les dues pàgines: així el navegador descarrega la versió nova en lloc de fer servir la que tenia guardada.

## Limitacions

- La web no té servidor: les taules ocupades són dades d'exemple i les reserves es guarden al navegador (`localStorage`).
- Quan hi hagi sensors i servidor, l'ocupació es llegirà de Home Assistant.
