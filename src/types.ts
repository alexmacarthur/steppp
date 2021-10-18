export type BuildAnimationArgs = {
    frames: any[]
    targetElement: HTMLElement,
    options: KeyframeAnimationOptions
}
export type Frame = {
    [key: string]: any
}
export type FrameDef = {
    enter: Frame[],
    exit: Frame[]
}
export type Direction = `forward` | `backward`;
export type Options = {
    stepIsValid?: (step: HTMLElement) => Promise<boolean>;
    frames: Frame[] | FrameDef
}

export type StepMovementArgs = { stepName?: string, direction?: Direction }
export type CommittableAnimation = Animation & {
    commitStyles: () => any,
    persist: () => any
}
