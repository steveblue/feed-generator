import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return
    const ops = await getOpsByType(evt)

    // This logs the text of every post off the firehose.
    // Just for fun :)
    // Delete before actually using
    // for (const post of ops.posts.creates) {
    //   console.log(post.record.text)
    // }

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const postsToCreate = ops.posts.creates
      .filter((create) => {
        // only web component related posts
        const keywords = [
          'web component',
          'custom element',
          '#webcomponent',
          '#customelement',
        ]
        return keywords.some((keyword) =>
          create.record.text.toLowerCase().includes(keyword),
        )
      })
      .map((create) => {
        // map web component posts to a db row
        return {
          uri: create.uri,
          cid: create.cid,
          replyParent: create.record?.reply?.parent.uri ?? null,
          replyRoot: create.record?.reply?.root.uri ?? null,
          indexedAt: new Date().toISOString(),
        }
      })

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }

    const indiePostsToDelete = ops.posts.deletes.map((del) => del.uri)
    const indiePostsToCreate = ops.posts.creates
      .filter((create) => {
        // only indie music related posts
        const keywords = [
          'indie music',
          'independent music',
          'indie rock',
          'indie pop',
          'indie country',
          'indie folk',
          'indie punk',
          'indie rap',
          'indie hip hop',
          'indie hardcore',
          'indie post punk',
          'indie post rock',
          'indie EP',
          'indie album',
          'indie record',
          'experimental music',
          'avant-garde music',
          'avant garde music',
          'indie song',
          'indie band',
          'record shop',
          'record store',
          '#indiemusic',
          '#indierock',
          '#indiepop',
          '#indiecountry',
          '#indiefolk',
          '#indiepunk',
          '#indierap',
          '#indiehiphop',
          '#indiehardcore',
          '#indiepostrock',
          '#indiepostpunk',
          '#experimentalmusic',
          '#avant-gardemusic',
          '#avantgardemusic',
        ]
        const antiMusicKeywords = [
          'film',
          'cinema',
          'game',
          'developer',
          'bookstore',
          'publisher',
          'author',
          'contractor',
          'press',
          'journal',
          'comic',
          'retailer',
          'craft',
          'business',
          'review',
          'novel',
          'study',
          'filmmaker',
          'design',
          'research',
          'magazine',
          'school',
          'fashion',
          'living',
          'brewery',
          'candidate',
          'coffee',
          'distributor',
          'marketplace',
          'bookshop',
          'software',
          'consultant',
          'festival',
          'theater',
          'animation',
          'agency',
          'podcast',
          'grocer',
          'board game',
          'restaurant',
          'toy maker',
          'watchmaker',
          'perfumer',
          'gallery',
          'bookseller',
          'boutique',
          'think tank',
          'duchy',
          'state',
          'country',
          'novel',
          'brand',
          'energy',
          'film festival',
          'media',
          'flag',
          'republic',
          'policy',
          'creator',
        ]

        function doesNotIncludeAllKeywords() {
          return !antiMusicKeywords.some(
            (keyword) =>
              recordText
                .toLowerCase()
                .includes('indie ' + keyword.toLowerCase()) ||
              recordText
                .toLowerCase()
                .includes('independent ' + keyword.toLowerCase()),
          )
        }

        const recordText = create.record.text.toLowerCase()

        if (
          doesNotIncludeAllKeywords() &&
          !recordText.includes('independence day') &&
          keywords.some((keyword) =>
            recordText.toLowerCase().includes(keyword.toLowerCase()),
          )
        ) {
          return true
        } else {
          return false
        }
      })
      .map((create) => {
        // map indie posts to a db row
        return {
          uri: create.uri,
          cid: create.cid,
          replyParent: create.record?.reply?.parent.uri ?? null,
          replyRoot: create.record?.reply?.root.uri ?? null,
          indexedAt: new Date().toISOString(),
        }
      })

    if (indiePostsToDelete.length > 0) {
      await this.db
        .deleteFrom('indie_post')
        .where('uri', 'in', indiePostsToDelete)
        .execute()
    }
    if (indiePostsToCreate.length > 0) {
      await this.db
        .insertInto('indie_post')
        .values(indiePostsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }

    const computerArtToDelete = ops.posts.deletes.map((del) => del.uri)
    const computerArtToCreate = ops.posts.creates
      .filter((create) => {
        // only web component related posts

        const computerArtistsAndMusicians = [
          'Nam June Paik',
          'Laurie Anderson',
          'Ryoji Ikeda',
          'Lillian Schwartz',
          'Casey Reas',
          'John Whitney',
          'Manfred Mohr',
          'Harold Cohen',
          'Holly Herndon',
          'David Rokeby',
          'Rafael Lozano-Hemmer',
          'Steve Reich',
          'Toshio Iwai',
          'Pauline Oliveros',
          'Vera Molnár',
          'Steve Mann',
          'Negativland',
          'Carsten Nicolai (Alva Noto)',
          'Jennifer Steinkamp',
          'Camille Utterback',
          'Evan Roth',
          'Zach Lieberman',
          'Marina Abramović',
          'Daito Manabe',
          'Char Davies',
          'Mary Flanagan',
          'Cory Arcangel',
          'Atau Tanaka',
          'Stelarc',
          'Scott Snibbe',
          'Elliot Sharp',
          'Gary Hill',
          'Bill Viola',
          'Hans-Christoph Steiner',
          'Golan Levin',
          'Julius Popp',
          'Edwin van der Heide',
          'Mark Fell',
          'Marnix de Nijs',
          'Quayola',
          'Robin Fox',
          'Rafael Lozano-Hemmer',
          'Susan Hiller',
          'Matthias Osterwold',
          'Luke Dubois',
          'Vuk Cosic',
          'Scott Draves',
          'Christian Marclay',
        ]

        const creativeCodingKeywords = [
          'Computer art',
          'Video art',
          'Computer music',
          ' Net art',
          'Generative art',
          'Interactive installations',
          'Noise algorithms',
          'Shader programming',
          'Projection mapping',
          'Glitch art',
          'Parametric design',
          'Computational geometry',
          'Cellular automata',
          'Evolutionary algorithms',
          'Machine learning in art',
          'Audio-reactive visuals',
          'Procedural generation',
          'Creative coding frameworks',
          'Digital aesthetics',
          'Algorithmic composition',
          'Computational creativity',
          'Geometric patterns',
          'Swarm intelligence',
          'Virtual reality art',
          'Augmented reality experiences',
          'Emergence in art',
          'Computational typography',
          'Algorithmic animation',
          'Generative music',
          'Interactive storytelling',
          'Cybernetic art',
          'Artificial life simulations',
          'Chaos theory in art',
          'Computational aesthetics',
          'Code as medium',
          'Digital sculpture',
          'Audio synthesizer',
          'Video synthesizer',
          'Analog synthesizer',
          'Digital synthesizer',
          'Circuit bending',
        ]
        const creativeCodingTools = [
          'p5.js',
          'WebGL',
          'Three.js',
          'D3.js',
          'Processing',
          'OpenFrameworks',
          'Cinder',
          'Paper.js',
          'Fabric.js',
          'Pixi.js',
          'Phaser',
          'CreateJS',
          'Two.js',
          'Zdog',
          'Pts.js',
          'Tone.js',
          'ml5.js',
          'Matter.js',
          'Regl',
          'Konva.js',
          'Babylon.js',
          'VDMX',
          'TouchDesigner',
          'Modul8',
          'ArKaos GrandVJ',
          'Serato Video',
          'CoGe VJ',
          'Synesthesia',
          'Millumin',
          'Lumen',
          'Max/MSP',
          'Max',
          'Jitter',
          "Cycling '74",
          'cycling74',
          'cycling 74',
        ]

        const negativeCCKeywords = ['WebGlaze']

        return (
          (!negativeCCKeywords.some((keyword) =>
            create.record.text.toLowerCase().includes(keyword.toLowerCase()),
          ) &&
            creativeCodingKeywords.some((keyword) =>
              create.record.text.toLowerCase().includes(keyword.toLowerCase()),
            )) ||
          (creativeCodingKeywords.some((keyword) =>
            create.record.text.toLowerCase().includes(keyword.toLowerCase()),
          ) &&
            creativeCodingTools.some((keyword) =>
              create.record.text.toLowerCase().includes(keyword.toLowerCase()),
            )) ||
          computerArtistsAndMusicians.some((keyword) =>
            create.record.text.toLowerCase().includes(keyword.toLowerCase()),
          )
        )
      })
      .map((create) => {
        // map web component posts to a db row
        return {
          uri: create.uri,
          cid: create.cid,
          replyParent: create.record?.reply?.parent.uri ?? null,
          replyRoot: create.record?.reply?.root.uri ?? null,
          indexedAt: new Date().toISOString(),
        }
      })

    if (computerArtToDelete.length > 0) {
      await this.db
        .deleteFrom('ca_post')
        .where('uri', 'in', computerArtToDelete)
        .execute()
    }
    if (computerArtToCreate.length > 0) {
      await this.db
        .insertInto('ca_post')
        .values(computerArtToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
