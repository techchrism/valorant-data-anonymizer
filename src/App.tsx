import type {Component} from 'solid-js'
import {createEffect, createMemo, createSignal} from 'solid-js'
import {anonymize} from './anonymize'

const App: Component = () => {
    const [inputText, setInputText] = createSignal('')
    const [scrollPosition, setScrollPosition] = createSignal(0)
    let inputTextArea: HTMLTextAreaElement
    let outputTextArea: HTMLTextAreaElement

    const outputText = createMemo(() => {
        return anonymize(inputText())
    })

    createEffect(() => {
        const scrollPos = scrollPosition()
        inputTextArea.scrollTop = scrollPos
        outputTextArea.scrollTop = scrollPos
    })

    return (
        <>
            <div class="flex flex-col min-h-screen">
                <h1 class="text-4xl text-center py-4 font-semibold">Valorant Data Anonymizer</h1>
                <div class="flex-grow flex flex-row w-full px-4 pb-4 space-x-4">
                    <div class="flex-grow flex flex-col">
                        <label for="input" class="text-center text-xl mb-2">Input</label>
                        <textarea
                            ref={inputTextArea}
                            onScroll={(e) => setScrollPosition(e.currentTarget.scrollTop)}
                            id="input"
                            onInput={(e) => setInputText(e.target.value)}
                            class="flex-grow resize-none bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50 rounded-2xl p-2"
                            placeholder="Paste your data here"/>
                    </div>
                    <div class="flex-grow flex flex-col">
                        <label for="output" class="text-center text-xl mb-2">Output</label>
                        <textarea
                            ref={outputTextArea}
                            onScroll={(e) => setScrollPosition(e.currentTarget.scrollTop)}
                            readonly
                            value={outputText()}
                            id="output"
                            class="flex-grow resize-none bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50 rounded-2xl p-2"
                            placeholder="Output data"/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App
