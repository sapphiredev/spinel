export type NodeQueryType = 'class' | 'classMethod' | 'method' | 'event' | 'module' | 'global' | 'misc';

export type NodeDocTypes = PurpleClass | NodeDocsGlobal | NodeDocsMethod | NodeDocsMisc | NodeDocsModule | UnknownModule;

export interface NodeDocSimilarityEntry {
	name: string;
	distance: number;
	entry: NodeDocTypes;
}

export interface NodeDocs {
	classes: PurpleClass[];

	globals: NodeDocsGlobal[];

	methods: NodeDocsMethod[];

	miscs: NodeDocsMisc[];

	modules: NodeDocsModule[];
}

export interface NodeDocsCommonProperties {
	name: string;
	desc?: string;
	module?: any;
}

export interface UnknownModule extends NodeDocsCommonProperties {
	source: Source | string;
	_source: Source | string;
	type: any;
	textRaw: string;
}

export interface PurpleClass extends NodeDocsCommonProperties {
	[key: string]: any;

	displayName?: string;

	meta?: PurpleMeta;

	methods?: PurpleMethod[];

	modules?: PurpleModule[];

	properties?: ModuleElement[];

	signatures?: StickySignature[];

	source?: string;

	textRaw: string;

	type: TypeEnum;
}

export interface PurpleMeta {
	added?: string[];

	changes: PurpleChange[];
}

export interface PurpleChange {
	description: string;

	'pr-url': string;

	version: string[] | string;
}

export interface PurpleMethod {
	desc: string;

	name: string;

	signatures: PurpleSignature[];

	textRaw: string;

	type: MethodType;
}

export interface PurpleSignature {
	params: PurpleParam[];
}

export interface PurpleParam {
	name: string;

	textRaw: string;

	type: ParamType;
}

export enum ParamType {
	Function = 'Function',
	Number = 'number',
	Object = 'Object',
	String = 'string',
	StringBufferUint8Array = 'string|Buffer|Uint8Array',
	StringString = 'string|string[]'
}

export enum MethodType {
	Method = 'method'
}

export interface PurpleModule {
	desc: string;

	displayName: string;

	name: string;

	textRaw: string;

	type: TypeEnum;
}

export enum TypeEnum {
	Class = 'class',
	Misc = 'misc',
	Module = 'module'
}

export interface FluffyReturn {
	desc?: string;

	name: Name;

	options?: EventElement[];

	textRaw: string;

	type: string;
}

export interface IndigoParam extends NodeDocsCommonProperties {
	default?: string;

	options?: EventElement[];

	textRaw: string;

	type: string;
}

export interface EventSignature {
	params: IndigoParam[];

	return?: EventElement;
}

export interface MethodElement {
	default?: string;

	desc?: string;

	meta?: PurpleMeta;

	name?: string;

	options?: MethodElement[];

	params?: ModuleElement[];

	properties?: ModuleElement[];

	signatures?: EventSignature[];

	textRaw: string;

	type?: string;
}

export interface StickyParam extends NodeDocsCommonProperties {
	options?: MethodElement[];

	textRaw: string;

	type: string;
}

export interface FluffySignature {
	params: StickyParam[];

	return?: FluffyReturn;
}

export interface TentacledParam extends NodeDocsCommonProperties {
	options?: ModuleElement[];

	textRaw: string;

	type: string;
}

export interface EventElement extends NodeDocsCommonProperties {
	default?: string;

	displayName?: string;

	meta?: PurpleMeta;

	methods?: PropertyElement[];

	modules?: PurpleModule[];

	options?: EventElement[];

	params?: TentacledParam[];

	shortDesc?: string;

	signatures?: FluffySignature[];

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type?: string;
}

export interface ModuleElement {
	default?: string;

	desc?: string;

	displayName?: string;

	events?: EventElement[];

	meta?: FluffyMeta;

	miscs?: ModuleElement[];

	name?: string;

	options?: ModuleElement[];

	params?: ModuleElement[];

	signatures?: TentacledSignature[];

	textRaw: string;

	type?: string;
}

export enum Name {
	Return = 'return'
}

export interface PropertyElement {
	default?: string;

	desc?: string;

	displayName?: string;

	meta?: PurpleMeta;

	miscs?: PropertyElement[];

	modules?: PropertyElement[];

	name?: string;

	options?: PropertyElement[];

	params?: any[];

	shortDesc?: string;

	signatures?: CtorSignature[];

	textRaw: string;

	type?: string;
}

export interface CtorSignature {
	params: FluffyParam[];

	return?: PurpleReturn;
}

export interface FluffyParam extends NodeDocsCommonProperties {
	default?: string;

	options?: OptionElement[];

	textRaw: string;

	type: ParamType;
}

export interface OptionElement extends NodeDocsCommonProperties {
	default?: string;

	textRaw: string;

	type: string;
}

export interface PurpleReturn extends NodeDocsCommonProperties {
	textRaw: string;

	type: string;
}

export interface FluffyMeta {
	added?: string[];

	changes: FluffyChange[];
}

export interface FluffyChange {
	description: string;

	'pr-url': string;

	version: string;
}

export interface TentacledSignature {
	params: OptionElement[];

	return?: PurpleReturn;
}

export interface StickySignature {
	desc: string;

	params: PurpleParam[];
}

export interface NodeDocsGlobal extends NodeDocsCommonProperties {
	classes?: GlobalClass[];

	introduced_in?: string;

	meta?: PurpleMeta;

	methods?: GlobalMethod[];

	modules?: ModuleElement[];

	properties?: GlobalProperty[];

	source: Source;

	textRaw: string;

	type: GlobalType;
}

export interface GlobalClass extends NodeDocsCommonProperties {
	classMethods?: EventElement[];

	events?: PurpleEvent[];

	meta?: PurpleMeta;

	methods?: FluffyMethod[];

	properties?: PurpleProperty[];

	textRaw: string;

	type: TypeEnum;
}

export interface PurpleEvent {
	desc: string;

	meta: PurpleMeta;

	name: string;

	params: ModuleElement[];

	textRaw: string;

	type: EventType;
}

export enum EventType {
	Event = 'event'
}

export interface FluffyMethod {
	desc: string;

	meta: PurpleMeta;

	name: string;

	signatures: IndigoSignature[];

	stability?: number;

	stabilityText?: MethodStabilityText;

	textRaw: string;

	type: MethodType;
}

export interface IndigoSignature {
	params: MethodElement[];

	return?: MethodElement;
}

export enum MethodStabilityText {
	DeprecatedUseSubpathPatternsInstead = 'Deprecated: Use subpath patterns instead.',
	Experimental = 'Experimental'
}

export interface PurpleProperty {
	desc: string;

	meta: PurpleMeta;

	name: string;

	textRaw: string;

	type: string;
}

export interface GlobalMethod {
	desc: string;

	meta: PurpleMeta;

	modules?: ModuleElement[];

	name: string;

	signatures: IndigoSignature[];

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: MethodType;
}

export interface GlobalProperty extends NodeDocsCommonProperties {
	meta?: EventMeta;

	methods?: EventElement[];

	modules?: PropertyElement[];

	properties?: PropertyElement[];

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: string;
}

export interface EventMeta {
	added?: string[];

	changes: TentacledChange[];

	deprecated?: string[];
}

export interface TentacledChange {
	commit?: string;

	description: string;

	'pr-url'?: string;

	version: string[] | string;
}

export enum Source {
	DocAPIGlobalsMd = 'doc/api/globals.md',
	DocAPIProcessMd = 'doc/api/process.md'
}

export enum GlobalType {
	Global = 'global'
}

export interface NodeDocsMethod extends NodeDocsCommonProperties {
	meta?: PurpleMeta;

	signatures: PurpleSignature[];

	source: Source;

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: MethodType;
}

export interface NodeDocsMisc extends NodeDocsCommonProperties {
	classes?: PurpleClass[];

	globals?: MiscGlobal[];

	introduced_in: string;

	meta?: PurpleMeta;

	methods?: EventElement[];

	miscs: PurpleMisc[];

	properties?: MiscProperty[];

	source: string;

	stability?: number;

	stabilityText?: MiscStabilityText;

	textRaw: string;

	type: TypeEnum;
}

export interface MiscGlobal {
	classes?: GlobalClass[];

	desc: string;

	meta: PurpleMeta;

	methods?: EventElement[];

	name: string;

	properties?: PropertyElement[];

	textRaw: string;

	type: GlobalType;
}

export interface PurpleMisc extends NodeDocsCommonProperties {
	displayName?: string;

	meta?: PurpleMeta;

	miscs?: PurpleClass[];

	modules?: MiscModule[];

	properties?: MethodElement[];

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: TypeEnum;
}

export interface MiscModule extends NodeDocsCommonProperties {
	displayName: string;

	meta?: TentacledMeta;

	modules?: FluffyModule[];

	properties?: MethodElement[];

	stability?: number;

	stabilityText?: MethodStabilityText;

	textRaw: string;

	type: TypeEnum;
}

export interface TentacledMeta {
	added?: string[];

	changes: StickyChange[];

	napiVersion?: number[];

	removed?: string[];
}

export interface StickyChange {
	commit?: string;

	description: string;

	'pr-url'?: string[] | string;

	version: string[] | string;
}

export interface FluffyModule {
	desc: string;

	displayName: string;

	meta?: StickyMeta;

	name: string;

	stability?: number;

	stabilityText?: MethodStabilityText;

	textRaw: string;

	type: TypeEnum;
}

export interface StickyMeta {
	added?: string[];

	changes: TentacledChange[];

	napiVersion?: number[];
}

export interface MiscProperty {
	desc: string;

	methods: EventElement[];

	name: string;

	properties: EventElement[];

	textRaw: string;

	type: ParamType;
}

export enum MiscStabilityText {
	Deprecated = 'Deprecated',
	Experimental = 'Experimental',
	Legacy = 'Legacy',
	Stable = 'Stable'
}

export interface NodeDocsModule extends NodeDocsCommonProperties {
	classes?: FluffyClass[];

	displayName?: string;

	events?: MethodElement[];

	introduced_in?: string;

	meta?: IndigoMeta;

	methods?: StickyMethod[];

	miscs?: ModuleMisc[];

	modules?: TentacledModule[];

	properties?: IndigoProperty[];

	source: string;

	stability?: number;

	stabilityText?: MiscStabilityText;

	textRaw: string;

	type: TypeEnum;

	vars?: FluffyVar[];
}

export interface FluffyClass extends NodeDocsCommonProperties {
	classMethods?: ModuleElement[];

	events?: FluffyEvent[];

	meta?: EventMeta;

	methods?: TentacledMethod[];

	modules?: ClassModule[];

	properties?: FluffyProperty[];

	signatures?: IndecentSignature[];

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: TypeEnum;
}

export interface FluffyEvent {
	desc: string;

	meta?: EventMeta;

	name: string;

	params: PropertyElement[];

	textRaw: string;

	type: EventType;
}

export interface TentacledMethod extends NodeDocsCommonProperties {
	meta?: EventMeta;

	methods?: PropertyElement[];

	modules?: PropertyElement[];

	properties?: MethodElement[];

	signatures: IndigoSignature[];

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: MethodType;
}

export interface ClassModule {
	ctors?: EventElement[];

	desc: string;

	displayName: string;

	meta?: PurpleMeta;

	methods?: EventElement[];

	modules?: PropertyElement[];

	name: string;

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: TypeEnum;
}

export interface FluffyProperty extends NodeDocsCommonProperties {
	default?: string;

	meta?: EventMeta;

	methods?: EventElement[];

	options?: EventElement[];

	shortDesc?: string;

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type?: string;
}

export interface IndecentSignature {
	desc?: string;

	params: MethodElement[];

	return?: MethodElement;
}

export interface IndigoMeta {
	added?: string[];

	changes: FluffyChange[];

	deprecated?: string[];
}

export interface StickyMethod extends NodeDocsCommonProperties {
	meta?: EventMeta;

	methods?: PropertyElement[];

	miscs?: PropertyElement[];

	modules?: PropertyElement[];

	properties?: PropertyElement[];

	signatures: HilariousSignature[];

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: MethodType;
}

export interface HilariousSignature {
	params: PropertyElement[];

	return?: PropertyElement;
}

export interface ModuleMisc extends NodeDocsCommonProperties {
	introduced_in?: string;

	meta?: PurpleMeta;

	methods?: MethodElement[];

	miscs?: FluffyMisc[];

	textRaw: string;

	type: TypeEnum;
}

export interface FluffyMisc extends NodeDocsCommonProperties {
	classes?: GlobalClass[];

	ctors?: PropertyElement[];

	displayName?: string;

	events?: ModuleElement[];

	examples?: ModuleElement[];

	meta?: PurpleMeta;

	methods?: IndigoMethod[];

	miscs?: ModuleElement[];

	modules?: ModuleElement[];

	textRaw: string;

	type: TypeEnum;
}

export interface IndigoMethod {
	desc: string;

	meta?: PurpleMeta;

	name: string;

	signatures: AmbitiousSignature[];

	textRaw: string;

	type: MethodType;
}

export interface AmbitiousSignature {
	params: ModuleElement[];

	return?: ModuleElement;
}

export interface TentacledModule extends NodeDocsCommonProperties {
	classes?: TentacledClass[];

	displayName: string;

	meta?: PurpleMeta;

	methods?: IndecentMethod[];

	miscs?: EventElement[];

	modules?: StickyModule[];

	properties?: StickyProperty[];

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: TypeEnum;

	vars?: PurpleVar[];
}

export interface TentacledClass extends NodeDocsCommonProperties {
	events?: EventElement[];

	meta?: IndigoMeta;

	methods?: MethodElement[];

	modules?: EventElement[];

	properties?: TentacledProperty[];

	signatures?: CunningSignature[];

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: TypeEnum;
}

export interface TentacledProperty {
	default?: string;

	desc: string;

	meta?: IndigoMeta;

	modules?: ModuleElement[];

	name: string;

	shortDesc?: string;

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type?: string;
}

export interface CunningSignature {
	desc: string;

	params: ModuleElement[];
}

export interface IndecentMethod extends NodeDocsCommonProperties {
	meta?: EventMeta;

	miscs?: ModuleElement[];

	modules?: ModuleElement[];

	properties?: ModuleElement[];

	signatures: MagentaSignature[];

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: MethodType;
}

export interface MagentaSignature {
	params: EventElement[];

	return?: EventElement;
}

export interface StickyModule extends NodeDocsCommonProperties {
	classes?: MethodElement[];

	displayName: string;

	meta?: PurpleMeta;

	methods?: ModuleElement[];

	modules?: PurpleClass[];

	properties?: PropertyElement[];

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: TypeEnum;
}

export interface StickyProperty extends NodeDocsCommonProperties {
	default?: string;

	meta?: EventMeta;

	methods?: PropertyElement[];

	modules?: PropertyElement[];

	properties?: PropertyElement[];

	shortDesc?: string;

	stability?: number;

	stabilityText?: MiscStabilityText;

	textRaw: string;

	type?: string;
}

export interface PurpleVar {
	desc: string;

	meta: PurpleMeta;

	methods?: EventElement[];

	name: string;

	properties?: VarMethod[];

	textRaw: string;

	type: string;
}

export interface VarMethod {
	desc: string;

	meta: EventMeta;

	modules?: ModuleElement[];

	name: string;

	signatures?: AmbitiousSignature[];

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type: string;
}

export interface IndigoProperty extends NodeDocsCommonProperties {
	default?: string;

	meta?: EventMeta;

	methods?: VarMethod[];

	options?: ModuleElement[];

	properties?: ModuleElement[];

	shortDesc?: string;

	stability?: number;

	stabilityText?: string;

	textRaw: string;

	type?: string;
}

export interface FluffyVar {
	desc: string;

	meta: PurpleMeta;

	methods: ModuleElement[];

	name: TypeEnum;

	properties: VarMethod[];

	textRaw: string;

	type: string;
}
