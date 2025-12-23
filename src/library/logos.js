import { slug } from "./format";

export const PARTY_LOGOS = {
  Samfylkingin: "/logos/samfylkingin.png",
  "Sjálfstæðisflokkur": "/logos/sjalfstaedisflokkur.png",
  Viðreisn: "/logos/vidreisn.png",
  Framsóknarflokkur: "/logos/framsokn.png",
  "Miðflokkurinn": "/logos/midflokkurinn.png",
  "Flokkur fólksins": "/logos/flokkur_folksins.svg",
  Píratar: "/logos/piratar.png",
  "Sósíalistaflokkur Íslands": "/logos/sosialistaflokkur.png",
  "Vinstrihreyfingin - grænt framboð": "/logos/vg.png",
  "Björt framtíð": "/logos/bjort_framtid.png",
  Borgarahreyfingin: "/logos/borgarahreyfingin.png",
  "Frjálslyndi flokkurinn": "/logos/frjalslyndi.jpg",
  "Nýtt afl": "/logos/nytt_afl.jpeg",
  Íslandshreyfingin: "/logos/islandshreyfingin.png",
  Lýðræðisflokkur: "/logos/lydraedisflokkur.png",
  Lýðræðishreyfingin: "/logos/lydraedishreyfingin.png",
  Regnboginn: "/logos/regnboginn.jpg",
  Landsbyggðarflokkurinn: "/logos/landsbyggdarflokkurinn.jpg",
  Dögun: "/logos/dogun.png",
  "Flokkur heimilanna": "/logos/flokkur_heimilanna.png",
  "Hægri grænir": "/logos/haegri_graenir.png",
  "Lýðræðisvaktin": "/logos/lydraedisvaktin.png",
};

export function resolveLogo(party) {
  return PARTY_LOGOS[party] ?? `/logos/${slug(party)}.png`;
}
