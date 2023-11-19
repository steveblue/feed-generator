import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as webComponents from './web-components'
import * as indieMusic from './indie-music'

type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  [webComponents.shortname]: webComponents.handler,
  [indieMusic.shortname]: indieMusic.handler,
}
export default algos
