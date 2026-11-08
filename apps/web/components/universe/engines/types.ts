import type {JSX} from 'react';
export interface SceneProps<C> {c: C; scene: number; p: number}
export interface ExploreProps<C> {c: C}
export interface EngineView<C> {
  /** Pure function of (scene, progress): enables scrubbing, replay and reduced motion. */
  Scene: (props: SceneProps<C>) => JSX.Element;
  /** Stateful free-play mode where the learner manipulates the model. */
  Explore: (props: ExploreProps<C>) => JSX.Element;
}
