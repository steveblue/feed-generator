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
        const keywords = ['web component', 'custom element']
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
          'indie rock',
          'indie pop',
          'indie country',
          'indie folk',
          'indie punk',
          'indie rap',
          'indie hip hop',
          'indie hardcore',
          'experimental music',
          'avant-garde music',
          'avant garde music',
        ]

        const musicKeywords = [
          'music',
          'rock',
          'experimental',
          'avant-garde',
          'avant garde',
          'pop',
          'country',
          'folk',
          'punk',
          'hip hop',
          'rap',
          'hardcore',
          'album',
          'track',
          'release',
          'song',
          'alternative',
          'record',
          'EP',
          'band',
        ]

        if (
          keywords.some((keyword) =>
            create.record.text.toLowerCase().includes(keyword),
          )
        ) {
          return true
        } else if (
          (create.record.text.toLowerCase().includes(' indie ') ||
            create.record.text.toLowerCase().includes(' independent ')) &&
          musicKeywords.some((keyword) =>
            create.record.text.toLowerCase().includes(` ${keyword} `),
          )
        ) {
          return true
        } else {
          return false
        }
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
  }
}
