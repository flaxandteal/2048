require "date"
require "json"
require "pathname"

namespace :appcache do
  desc "update the date in the appcache file (in the gh-pages branch)"
  task :update do
    appcache = File.read("cache.appcache")
    updated  = "# Updated: #{DateTime.now}"

    File.write("cache.appcache", appcache.sub(/^# Updated:.*$/, updated))
  end
end

namespace :locales do
  # Locale codes (= bare filename without .json) to mark as hidden in the
  # generated manifest. Hidden locales are still built into locales/index.json
  # (and still loadable via ?lang=<code> for testing), but the switcher skips
  # them at render time so they don't appear in the picker. The hidden flag
  # lives in the generated manifest rather than in each locale file to avoid
  # polluting translator-facing JSON with non-string metadata that could
  # confuse Weblate's flat-JSON parser.
  HIDDEN_LOCALES = %w[sco_ulster].freeze

  desc "generate locales/index.json from locales/*.json for the language switcher"
  task :build do
    locales_dir = Pathname.new(__dir__) + "locales"
    output      = locales_dir + "index.json"

    unless locales_dir.directory?
      warn "error: #{locales_dir} does not exist"
      exit 1
    end

    files = locales_dir.glob("*.json").reject { |f| f.basename.to_s == "index.json" }

    # English first, then the rest alphabetically by stem.
    en     = locales_dir + "en.json"
    others = files.reject { |f| f.basename.to_s == "en.json" }
                  .sort_by { |f| f.basename(".json").to_s }
    ordered = (en.exist? ? [en] : []) + others

    entries = []
    ordered.each do |f|
      code = f.basename(".json").to_s

      begin
        data = JSON.parse(f.read)
      rescue => e
        warn "warning: skipping #{f.basename}: #{e.message}"
        next
      end

      entry = { "code" => code, "name" => data["language-name"] || code }
      family = data["language-family-name"]
      entry["family"] = family if family
      entry["hidden"] = true if HIDDEN_LOCALES.include?(code)
      entries << entry
    end

    output.write(JSON.pretty_generate(entries) + "\n")
    visible = entries.reject { |e| e["hidden"] }.length
    hidden  = entries.length - visible
    puts "wrote #{entries.length} locales (#{visible} visible, #{hidden} hidden) to #{output.relative_path_from(locales_dir.parent)}"
  end
end
