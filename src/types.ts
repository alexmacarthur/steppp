export type BuildAnimationArgs = {
    frames: any[]
    targetElement: HTMLElement,
    options: KeyframeAnimationOptions
}
export type Direction = `forward` | `backward`;
export type Options = {
    stepIsValid: (step: HTMLElement) => Promise<boolean>;
}
export type StepMovementArgs = { stepName?: string, direction?: Direction }
export type CommittableAnimation = Animation & {
    commitStyles: () => any,
    persist: () => any
}
