import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import InspectModule from "docxtemplater/js/inspect-module";

/**
 * Deterministic DOCX template filling — no AI involved at this stage, ever.
 * Placeholders use {{variable_name}} syntax (explicit delimiters, not
 * docxtemplater's default {variable_name}, to match the documented syntax).
 */
const DELIMITERS = { start: "{{", end: "}}" };

export function scanPlaceholders(buffer: Buffer): string[] {
  const zip = new PizZip(buffer);
  const inspectModule = new InspectModule();
  new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: DELIMITERS,
    modules: [inspectModule],
  });
  const tags = inspectModule.getAllTags();
  return Object.keys(tags).sort();
}

/**
 * Fills the template with the given variables. Unfilled/unknown tags render
 * as an empty string (nullGetter) rather than throwing, so a template with
 * an unmapped custom field still generates — the admin is warned separately
 * at upload time (see contract-templates route), not blocked at generation.
 */
export function renderTemplate(buffer: Buffer, variables: Record<string, string>): Buffer {
  const zip = new PizZip(buffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: DELIMITERS,
    nullGetter: () => "",
  });
  doc.render(variables);
  return doc.toBuffer();
}
