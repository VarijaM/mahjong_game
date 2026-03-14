import './ScoringSection.css'

export function ScoringSection() {
  return (
    <div className="scoring-section">
      <p className="scoring-intro">
        Scoring mahjong hands can be complicated. These rules are based on classic Chinese-style play. 
        Many households have their own variations—feel free to adapt!
      </p>

      <h2>Calculating the Score</h2>
      <p>Calculate your score in three steps:</p>
      <ol>
        <li>Count base score</li>
        <li>Add doubles (fans)</li>
        <li>Round up</li>
      </ol>

      <h3>Step 1: Count Base Score</h3>
      <ul>
        <li><strong>Did you win?</strong> YES → +30</li>
        <li><strong>Did you have any sets?</strong> YES → Add points (value sets like 1s, 9s, winds, dragons are worth more)</li>
        <li><strong>Value pair?</strong> (Dragons or winds) YES → +2</li>
        <li><strong>Unusual circumstances?</strong>
          <ul>
            <li>Picked up an eye as the last tile → +2</li>
            <li>Picked up the only viable call in a run (e.g. 3 for 1-2-3) → +2</li>
            <li>Self-draw from the wall (&quot;gee maw&quot;) → +2</li>
          </ul>
        </li>
      </ul>

      <h3>Step 2: Add Doubles (Fans)</h3>
      <p>Double your score for each of these:</p>
      <ul>
        <li><strong>Value sets:</strong> Each set of dragons or winds → 2×</li>
        <li><strong>All runs</strong> (no pungs) or <strong>all sets</strong> (no chows)</li>
        <li><strong>All one suit</strong> + some value tiles</li>
        <li><strong>Draw from back</strong> of the wall</li>
        <li><strong>All concealed</strong> (no melds laid down before winning)</li>
      </ul>

      <h3>Step 3: Round Up</h3>
      <p>Round up to the nearest multiple of 10. (e.g. 32 → 40)</p>

      <h2>Payout to the Winner</h2>
      <ul>
        <li><strong>You discarded the winning tile?</strong> Pay 2× the rounded score</li>
        <li><strong>Winner self-drew?</strong> All others pay 2×</li>
        <li><strong>Banker loses?</strong> Banker pays/receives double; bank passes to next player</li>
      </ul>

      <h2>Settling Up Amongst Non-Winners</h2>
      <p>Non-winners compare scores and pay the differential. The banker pays or receives double the differential. Same score = no chips exchanged.</p>

      <h2>Strategy Tips</h2>
      <ul>
        <li><strong>Go after difficult hands</strong> — more points for hands that defy probability</li>
        <li><strong>Get at least one set</strong> — ensures a minimum score (~10 pts) if you don&apos;t win</li>
        <li><strong>Establish a limit</strong> — max payout is often 500 points (6 fans) to avoid bankrupting others</li>
      </ul>
    </div>
  )
}
